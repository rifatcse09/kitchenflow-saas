import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import type { RestaurantRequest, RestaurantRequestsPage } from '../shared/types'

const PAGE_SIZE = 5

export function AdminRestaurants({
  pendingCount,
  catalogTick,
  onApprove,
}: {
  pendingCount: number
  catalogTick: number
  onApprove: (id: number) => Promise<void>
}) {
  const [rows, setRows] = useState<RestaurantRequest[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const fetchPage = useCallback(async (cursor?: number, append = false) => {
    const qs = new URLSearchParams({ limit: String(PAGE_SIZE) })
    if (cursor != null) qs.set('cursor', String(cursor))
    const res = await fetch(`${API_BASE}/admin/restaurant-requests?${qs}`)
    if (!res.ok) throw new Error('Could not load restaurant list')
    const data = (await res.json()) as RestaurantRequestsPage
    setRows((prev) => (append ? [...prev, ...data.items] : data.items))
    setNextCursor(data.nextCursor)
    return data
  }, [])

  const resetAndLoad = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      await fetchPage(undefined, false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [fetchPage])

  useEffect(() => {
    void resetAndLoad()
  }, [catalogTick, resetAndLoad])

  const loadMore = useCallback(async () => {
    if (nextCursor == null || loadingMore) return
    setLoadingMore(true)
    setError('')
    try {
      await fetchPage(nextCursor, true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load more')
    } finally {
      setLoadingMore(false)
    }
  }, [fetchPage, nextCursor, loadingMore])

  const pendingRows = useMemo(() => rows.filter((r) => r.status === 'PENDING'), [rows])
  const approvedRows = useMemo(() => rows.filter((r) => r.status === 'APPROVED'), [rows])

  return (
    <ScreenFrame
      title="Restaurant Approvals"
      subtitle={`${pendingCount} pending (all pages) · showing ${rows.length} loaded`}
      frameClassName="admin-portal-screen"
    >
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="hint">Loading restaurants…</p> : null}

      {!loading && pendingRows.length === 0 && pendingCount > 0 ? (
        <p className="center-text">More pending restaurants exist. Use &quot;Load more&quot; to find them.</p>
      ) : null}
      {!loading && pendingRows.length === 0 && pendingCount === 0 ? (
        <p className="center-text">No pending requests right now.</p>
      ) : null}

      {pendingRows.map((request) => (
        <article className="queue-card" key={request.id}>
          <div>
            <h4>{request.restaurantName}</h4>
            <p>
              {request.city} • {request.ownerName} • {request.ownerEmail}
            </p>
            {request.initialUserEmail ? (
              <p>
                Initial team: {request.initialUserEmail} ({request.initialUserRole})
              </p>
            ) : null}
          </div>
          <div className="action-col">
            <span className="status-pill pending">Pending</span>
            <button className="approve-btn" onClick={() => void onApprove(request.id)}>
              Approve
            </button>
          </div>
        </article>
      ))}

      {approvedRows.length > 0 ? (
        <>
          <h3 className="section-title">Approved (loaded)</h3>
          {approvedRows.map((request) => (
            <article className="queue-card" key={request.id}>
              <div>
                <h4>{request.restaurantName}</h4>
                <p>
                  {request.city} • {request.ownerName}
                </p>
              </div>
              <span className="status-pill ready">Approved</span>
            </article>
          ))}
        </>
      ) : null}

      {!loading && nextCursor != null ? (
        <button type="button" className="ghost-btn admin-restaurants-load-more" disabled={loadingMore} onClick={() => void loadMore()}>
          {loadingMore ? 'Loading…' : `Load more (cursor ${nextCursor})`}
        </button>
      ) : null}

      {!loading && nextCursor == null && rows.length > 0 ? (
        <p className="hint admin-restaurants-end">End of list. No more restaurants for this tenant catalog.</p>
      ) : null}
    </ScreenFrame>
  )
}

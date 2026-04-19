import { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../shared/constants'
import { nextQueueOrderAction, patchRestaurantOrderStatus, type QueueOrderRow } from './orderQueueActions'

const POLL_MS = 5000

type GuestOrderRow = QueueOrderRow

function KdsTicket({
  order,
  tenantId,
  onUpdated,
}: {
  order: GuestOrderRow
  tenantId: number
  onUpdated: (o: GuestOrderRow) => void
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const run = useCallback(
    async (next: string) => {
      setErr('')
      setBusy(true)
      try {
        const updated = (await patchRestaurantOrderStatus(tenantId, order.id, next)) as GuestOrderRow
        onUpdated(updated)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Update failed')
      } finally {
        setBusy(false)
      }
    },
    [order.id, tenantId, onUpdated],
  )

  const action = nextQueueOrderAction(order.status)

  return (
    <div
      className={`kds-ticket${order.status === 'COOKING' ? ' kds-ticket-active' : ''}${order.status === 'READY' ? ' kds-ticket-ready' : ''}`}
    >
      <div className="kds-ticket-top">
        #{order.id} · Table {order.tableCode}
      </div>
      <ul>
        {order.lines.map((l, idx) => (
          <li key={l.id ?? `${idx}-${l.name}`}>
            {l.qty}× {l.name}
          </li>
        ))}
      </ul>
      <div className="kds-ticket-meta">${order.total.toFixed(2)}</div>
      {err ? <p className="kds-ticket-error">{err}</p> : null}
      {action ? (
        <button
          className={`kds-ticket-action-btn kds-ticket-action-btn--${order.status.toLowerCase()}`}
          type="button"
          disabled={busy}
          onClick={() => void run(action.next)}
        >
          {busy ? 'Saving…' : action.label}
        </button>
      ) : null}
    </div>
  )
}

export function KitchenKDS({ tenantId }: { tenantId: number }) {
  const [orders, setOrders] = useState<GuestOrderRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const load = useCallback(async (showSpinner = false) => {
    setError('')
    if (showSpinner) setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/restaurant/${tenantId}/orders`)
      if (!res.ok) throw new Error('Could not load queue')
      const data = (await res.json()) as GuestOrderRow[]
      setOrders(data)
      setLastSync(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    void load(false)
    const t = window.setInterval(() => void load(false), POLL_MS)
    return () => window.clearInterval(t)
  }, [load])

  const onUpdated = useCallback((updated: GuestOrderRow) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
  }, [])

  const newOrders = orders.filter((o) => o.status === 'PENDING')
  const cooking = orders.filter((o) => o.status === 'COOKING')
  const ready = orders.filter((o) => o.status === 'READY')

  return (
    <div className="theme-kds kds-board">
      <header className="kds-board-head">
        <div className="kds-board-head-text">
          <span>Live queue</span>
          <span className="kds-board-sync">
            Auto-refresh every {POLL_MS / 1000}s
            {lastSync ? ` · last sync ${lastSync.toLocaleTimeString()}` : ''}
          </span>
        </div>
        <button type="button" className="kds-refresh" disabled={loading} onClick={() => void load(true)}>
          {loading ? 'Loading…' : 'Refresh now'}
        </button>
      </header>
      {error ? <p className="kds-board-error">{error}</p> : null}
      <div className="kds-columns">
        <section className="kds-column">
          <h3>New ({newOrders.length})</h3>
          {newOrders.length === 0 ? <p className="kds-empty">No new tickets</p> : null}
          {newOrders.map((o) => (
            <KdsTicket key={o.id} order={o} tenantId={tenantId} onUpdated={onUpdated} />
          ))}
        </section>
        <section className="kds-column">
          <h3>Cooking ({cooking.length})</h3>
          {cooking.length === 0 ? <p className="kds-empty">Nothing on the line</p> : null}
          {cooking.map((o) => (
            <KdsTicket key={o.id} order={o} tenantId={tenantId} onUpdated={onUpdated} />
          ))}
        </section>
        <section className="kds-column">
          <h3>Ready ({ready.length})</h3>
          {ready.length === 0 ? <p className="kds-empty">No orders waiting pickup</p> : null}
          {ready.map((o) => (
            <KdsTicket key={o.id} order={o} tenantId={tenantId} onUpdated={onUpdated} />
          ))}
        </section>
      </div>
    </div>
  )
}

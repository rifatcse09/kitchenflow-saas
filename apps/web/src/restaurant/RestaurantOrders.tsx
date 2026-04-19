import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import { nextQueueOrderAction, patchRestaurantOrderStatus, type QueueOrderRow } from './orderQueueActions'

type GuestOrderRow = QueueOrderRow & {
  customerPhone: string | null
  customerEmail: string | null
}

const POLL_MS = 5000

function orderStatusPillClass(status: string): string {
  const s = String(status).toUpperCase()
  if (s === 'PENDING') return 'pending'
  if (s === 'COOKING') return 'cooking'
  if (s === 'READY') return 'ready'
  if (s === 'COMPLETED') return 'completed'
  if (s === 'CANCELLED') return 'cancelled'
  return 'pending'
}

function QueueOrderCard({
  order,
  tenantId,
  onPatched,
}: {
  order: GuestOrderRow
  tenantId: number
  onPatched: (o: GuestOrderRow) => void
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const action = nextQueueOrderAction(order.status)
  const st = String(order.status).toLowerCase()

  const run = useCallback(
    async (next: string) => {
      setErr('')
      setBusy(true)
      try {
        const updated = (await patchRestaurantOrderStatus(tenantId, order.id, next)) as GuestOrderRow
        onPatched(updated)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Update failed')
      } finally {
        setBusy(false)
      }
    },
    [order.id, tenantId, onPatched],
  )

  return (
    <article className="queue-card queue-card--stacked">
      <div className="queue-card-head">
        <h4>
          Order #{order.id} · Table {order.tableCode}
        </h4>
        <span className={`status-pill ${orderStatusPillClass(order.status)}`}>{order.status}</span>
      </div>
      <p className="queue-card-lines">
        {order.lines.map((l) => `${l.qty}× ${l.name}`).join(' · ')} · ${order.total.toFixed(2)}
      </p>
      <small className="queue-card-contact">
        {order.customerPhone || order.customerEmail
          ? [order.customerPhone, order.customerEmail].filter(Boolean).join(' · ')
          : 'No contact (guest)'}
      </small>
      {err ? <p className="queue-card-error">{err}</p> : null}
      {action ? (
        <button
          type="button"
          className={`kds-ticket-action-btn kds-ticket-action-btn--${st}`}
          disabled={busy}
          onClick={() => void run(action.next)}
        >
          {busy ? 'Saving…' : action.label}
        </button>
      ) : (
        <p className="queue-card-terminal">
          {String(order.status).toUpperCase() === 'CANCELLED' ? 'Order cancelled.' : 'Order closed. No further steps.'}
        </p>
      )}
    </article>
  )
}

export function RestaurantOrders({ tenantId }: { tenantId: number }) {
  const [orders, setOrders] = useState<GuestOrderRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const load = useCallback(
    async (showSpinner = false) => {
      setError('')
      if (showSpinner) setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/restaurant/${tenantId}/orders`)
        if (!res.ok) throw new Error('Could not load orders')
        const data = (await res.json()) as GuestOrderRow[]
        setOrders(data)
        setLastSync(new Date())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    },
    [tenantId],
  )

  useEffect(() => {
    void load(true)
    const t = window.setInterval(() => void load(false), POLL_MS)
    return () => window.clearInterval(t)
  }, [load])

  const onPatched = useCallback((updated: GuestOrderRow) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)))
  }, [])

  const subtitle =
    lastSync != null
      ? `Guest orders · auto-refresh every ${POLL_MS / 1000}s · last sync ${lastSync.toLocaleTimeString()}`
      : 'Guest orders (QR / table) · tenant-scoped'

  return (
    <ScreenFrame title="Orders + kitchen queue" subtitle={subtitle} frameClassName="restaurant-portal-screen">
      <div className="queue-toolbar">
        <p className="hint queue-toolbar-hint">
          Same queue as <Link to="/restaurant/kds">Kitchen line</Link>. Advance tickets here or on the board.
        </p>
        <button type="button" className="ghost-btn queue-toolbar-btn" disabled={loading} onClick={() => void load(true)}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {orders.length === 0 && !error && !loading ? (
        <p className="hint">No orders yet. Customers submit from the guest menu after scanning a table QR.</p>
      ) : null}
      {orders.map((o) => (
        <QueueOrderCard key={o.id} order={o} tenantId={tenantId} onPatched={onPatched} />
      ))}
    </ScreenFrame>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { API_BASE } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import { useCustomerGuest } from './useCustomerGuest'

type GuestOrderRow = {
  id: number
  restaurantId: number
  tableCode: string
  status: string
  createdAt: string
  total: number
}

const ACTIVE = new Set(['PENDING', 'COOKING', 'READY'])
const TERMINAL = new Set(['COMPLETED', 'CANCELLED'])

function normStatus(s: string) {
  return String(s).toUpperCase()
}

/** Which order to show progress for: just-placed id, else newest in-progress, else newest overall. */
function pickFocusOrder(orders: GuestOrderRow[], orderIdFromNav?: number): GuestOrderRow | null {
  if (orders.length === 0) return null
  const byNewest = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  if (orderIdFromNav != null) {
    const hit = orders.find((o) => o.id === orderIdFromNav)
    if (hit) return hit
  }
  const inProg = byNewest.find((o) => ACTIVE.has(normStatus(o.status)))
  return inProg ?? byNewest[0]
}

function OrderProgressTimeline({ status }: { status: string }) {
  const s = normStatus(status)
  const steps = [
    { key: 'submitted', label: 'Order submitted' },
    { key: 'queue', label: 'Kitchen queue' },
    { key: 'cooking', label: 'Cooking' },
    { key: 'ready', label: 'Ready for pickup' },
  ]

  let activeIdx = 1
  if (s === 'PENDING') activeIdx = 1
  else if (s === 'COOKING') activeIdx = 2
  else if (s === 'READY') activeIdx = 3
  else return null

  return (
    <div className="timeline customer-order-timeline" style={{ marginTop: 16 }}>
      {steps.map((step, i) => {
        let cls = 'timeline-item'
        if (i < activeIdx) cls += ' done'
        else if (i === activeIdx) cls += ' active'
        return (
          <div key={step.key} className={cls}>
            {step.label}
          </div>
        )
      })}
    </div>
  )
}

export function CustomerTracking() {
  const loc = useLocation()
  const orderIdFromNav = (loc.state as { orderId?: number } | undefined)?.orderId
  const { session } = useCustomerGuest()
  const [orders, setOrders] = useState<GuestOrderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const tableOrders = useMemo(() => {
    if (!session) return []
    return orders.filter((o) => o.tableCode === session.tableCode)
  }, [orders, session])

  const focusOrder = useMemo(
    () => pickFocusOrder(tableOrders, orderIdFromNav),
    [tableOrders, orderIdFromNav],
  )

  const showProgress =
    focusOrder != null && ACTIVE.has(normStatus(focusOrder.status))

  const showCompleteMessage =
    focusOrder != null && TERMINAL.has(normStatus(focusOrder.status))

  const restaurantId = session?.restaurantId

  useEffect(() => {
    if (restaurantId == null) {
      setOrders([])
      return
    }

    let cancelled = false

    async function loadOrders(isInitial: boolean) {
      if (isInitial) {
        setLoading(true)
        setFetchError('')
      }
      try {
        const res = await fetch(`${API_BASE}/restaurant/${restaurantId}/orders`)
        if (!res.ok) throw new Error('Could not load orders for this restaurant')
        const data = (await res.json()) as GuestOrderRow[]
        if (!cancelled) setOrders(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled && isInitial) setFetchError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled && isInitial) setLoading(false)
      }
    }

    void loadOrders(true)

    // Poll while this screen is open so PENDING → COOKING → READY shows without manual refresh.
    const pollMs = 5000
    const id = window.setInterval(() => {
      void loadOrders(false)
    }, pollMs)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [restaurantId])

  const subtitle = session
    ? `${session.restaurantName ?? 'Restaurant'} · Table ${session.tableCode}`
    : 'Scan a table QR to scope status to one restaurant + table'

  return (
    <ScreenFrame title="Order status" subtitle={subtitle} frameClassName="customer-vibe-screen">
      {!session ? (
        <>
          <p className="hint">
            Each <strong>QR</strong> opens a session for one restaurant and table. Order status here lists{' '}
            <strong>guest orders for that tenant</strong> filtered to your table once you scan.
          </p>
          <Link to="/customer/welcome" className="primary-btn">
            Scan QR from welcome
          </Link>
        </>
      ) : loading ? (
        <p className="hint">Loading orders for this restaurant…</p>
      ) : fetchError ? (
        <p className="error-text">{fetchError}</p>
      ) : (
        <>
          {orderIdFromNav != null ? (
            <p className="hint">
              Latest submission: <strong>Order #{orderIdFromNav}</strong>. Below are recent orders for{' '}
              <strong>{session.tableCode}</strong> at this restaurant.
            </p>
          ) : (
            <p className="hint">
              Showing guest orders for <strong>{session.tableCode}</strong> at this restaurant (public demo list).
            </p>
          )}

          {tableOrders.length === 0 ? (
            <p className="hint">No orders yet for this table. Place one from the menu.</p>
          ) : (
            <ul className="customer-order-status-list">
              {tableOrders.map((o) => (
                <li key={o.id} className="customer-order-status-row">
                  <div>
                    <strong>#{o.id}</strong>
                    <span className={`status-pill ${String(o.status).toLowerCase()}`}>{o.status}</span>
                  </div>
                  <div className="customer-order-meta">
                    {new Date(o.createdAt).toLocaleString()} · ${o.total.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {showProgress && focusOrder ? (
            <OrderProgressTimeline status={focusOrder.status} />
          ) : null}

          {showCompleteMessage ? (
            <p className="hint customer-order-complete-msg">
              This order is finished in the kitchen. Thanks for ordering. Your server can help with the bill or any
              follow-up.
            </p>
          ) : null}
        </>
      )}

      <div className="customer-screen-footer-safe">
        <Link to="/customer/menu" className="primary-btn customer-footer-primary-btn">
          Back to menu
        </Link>
      </div>
    </ScreenFrame>
  )
}

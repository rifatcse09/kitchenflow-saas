import { useEffect, useState } from 'react'
import { API_BASE } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'

type GuestOrderRow = {
  id: number
  tableCode: string
  customerPhone: string | null
  customerEmail: string | null
  status: string
  total: number
  createdAt: string
  lines: Array<{ name: string; qty: number; unitPrice: number }>
}

export function RestaurantOrders({ tenantId }: { tenantId: number }) {
  const [orders, setOrders] = useState<GuestOrderRow[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/restaurant/${tenantId}/orders`)
        if (!res.ok) throw new Error('Could not load orders')
        const data = (await res.json()) as GuestOrderRow[]
        if (!cancelled) setOrders(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tenantId])

  return (
    <ScreenFrame title="Orders + kitchen queue" subtitle="Guest orders (QR / table) · tenant-scoped">
      {error ? <p className="error-text">{error}</p> : null}
      {orders.length === 0 && !error ? (
        <p className="hint">No orders yet. Customers submit from the guest menu after scanning a table QR.</p>
      ) : null}
      {orders.map((o) => (
        <article key={o.id} className="queue-card">
          <div>
            <h4>
              Order #{o.id} · Table {o.tableCode}
            </h4>
            <p>
              {o.lines.map((l) => `${l.qty}× ${l.name}`).join(' · ')} — ${o.total.toFixed(2)}
            </p>
            <small className="hint">
              {o.customerPhone || o.customerEmail
                ? [o.customerPhone, o.customerEmail].filter(Boolean).join(' · ')
                : 'No contact (guest)'}
            </small>
          </div>
          <span className={`status-pill ${o.status === 'PENDING' ? 'pending' : 'cooking'}`}>{o.status}</span>
        </article>
      ))}
    </ScreenFrame>
  )
}

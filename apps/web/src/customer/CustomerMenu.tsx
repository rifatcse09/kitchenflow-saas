import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import { useCustomerGuest } from './useCustomerGuest'

type ApiMenuItem = {
  id: number
  name: string
  category: string
  price: number
  available: boolean
}

export function CustomerMenu() {
  const { session, addToCart, cart } = useCustomerGuest()
  const [items, setItems] = useState<ApiMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/restaurant/${session.restaurantId}/menu-items`)
        if (!res.ok) throw new Error('Menu unavailable')
        const data = (await res.json()) as ApiMenuItem[]
        if (!cancelled) setItems(data.filter((i) => i.available))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load menu')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session])

  if (!session) {
    return (
      <ScreenFrame title="Scan a table QR" subtitle="No login required" frameClassName="customer-vibe-screen">
        <p className="hint">
          Scan the QR code at your table to open this restaurant’s menu. It encodes the restaurant and your table
          number.
        </p>
        <p className="hint">
          Demo link (dev):{' '}
          <Link to="/customer/r/1/t/T12">Open menu as Table T12 · Restaurant 1</Link>
        </p>
      </ScreenFrame>
    )
  }

  if (loading) {
    return (
      <ScreenFrame
        title="Menu"
        subtitle={`${session.restaurantName ?? 'Restaurant'} · ${session.tableCode}`}
        frameClassName="customer-vibe-screen"
      >
        <p className="hint">Loading…</p>
      </ScreenFrame>
    )
  }

  if (error) {
    return (
      <ScreenFrame title="Menu" subtitle={`Table ${session.tableCode}`} frameClassName="customer-vibe-screen">
        <p className="error-text">{error}</p>
      </ScreenFrame>
    )
  }

  const cartCount = cart.reduce((s, l) => s + l.qty, 0)

  return (
    <ScreenFrame
      title={session.restaurantName ?? 'Menu'}
      subtitle={`Table ${session.tableCode} · ${items.length} items`}
      frameClassName="customer-vibe-screen"
      headerAction={
        <button type="button" className="customer-hamburger" aria-label="Open menu">
          ☰
        </button>
      }
    >
      <div className="customer-menu-content">
        <div className="chips vibe-tabs">
          <span className="chip active">Steaks</span>
          <span className="chip">BBQ Plates</span>
          <span className="chip">Sides</span>
          <span className="chip">Drinks</span>
        </div>

        <div className="customer-menu-list">
          {items.map((item, index) => (
            <article key={item.id} className="list-item customer-menu-item">
              <div className={`menu-food-thumb food-${(index % 4) + 1}`} aria-hidden />
              <div>
                <h4>{item.name}</h4>
                <p>{item.category}</p>
                <small>+ Add Note</small>
              </div>
              <div className="menu-row-actions">
                <strong>${item.price}</strong>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() =>
                    addToCart({
                      menuItemId: item.id,
                      name: item.name,
                      price: item.price,
                      qty: 1,
                    })
                  }
                >
                  Add
                </button>
              </div>
            </article>
          ))}
        </div>

        <Link to="/customer/cart" className="customer-cart-bar">
          <span>View Order</span>
          <strong>{cartCount} item{cartCount === 1 ? '' : 's'}</strong>
        </Link>
      </div>
    </ScreenFrame>
  )
}

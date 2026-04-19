import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import { useCustomerGuest } from './useCustomerGuest'

export function CustomerCart() {
  const navigate = useNavigate()
  const { session, cart, updateQty, removeLine, clearCart, clearGuest } = useCustomerGuest()
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session || !cart.length) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/restaurant/${session.restaurantId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableCode: session.tableCode,
          customerPhone: phone.trim() || undefined,
          customerEmail: email.trim() || undefined,
          items: cart.map((l) => ({
            menuItemId: l.menuItemId,
            qty: l.qty,
            note: l.note,
          })),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        const msg = (j as { message?: string } | null)?.message
        throw new Error(msg ?? `Order failed (${res.status})`)
      }
      const data = (await res.json()) as { id: number }
      clearCart()
      navigate('/customer/tracking', { replace: true, state: { orderId: data.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) {
    return (
      <ScreenFrame title="Review order" subtitle="No table session" frameClassName="customer-vibe-screen">
        <p className="hint">
          <Link to="/customer/welcome">Scan a QR code</Link> first, or use the demo link on the menu page.
        </p>
      </ScreenFrame>
    )
  }

  if (!cart.length) {
    return (
      <ScreenFrame
        title="Review order"
        subtitle={`Table ${session.tableCode}`}
        frameClassName="customer-vibe-screen"
      >
        <p className="hint">Your cart is empty.</p>
        <Link to="/customer/menu" className="primary-btn">
          Back to menu
        </Link>
      </ScreenFrame>
    )
  }

  return (
    <ScreenFrame
      title="Review & submit"
      subtitle={`${session.restaurantName ?? 'Restaurant'} · Table ${session.tableCode}`}
      frameClassName="customer-vibe-screen"
    >
      <form className="customer-cart-form" onSubmit={handleSubmit}>
        {cart.map((line) => {
          const lineTotal = line.price * line.qty
          const unitLabel =
            line.price % 1 === 0 ? `$${line.price.toFixed(0)}` : `$${line.price.toFixed(2)}`
          return (
            <article
              key={line.menuItemId}
              className="list-item customer-menu-item customer-cart-line"
            >
              <div className="customer-cart-line-top">
                <h4>{line.name}</h4>
                <strong className="customer-cart-line-total">${lineTotal.toFixed(2)}</strong>
              </div>
              <p className="customer-cart-line-unit">{unitLabel} each</p>
              <div className="customer-cart-line-controls">
                <div className="customer-cart-qty-block">
                  <span className="field-label customer-cart-qty-label">Quantity</span>
                  <div className="qty-stepper" role="group" aria-label={`Quantity for ${line.name}`}>
                    <button
                      type="button"
                      className="qty-stepper-btn"
                      aria-label="Decrease quantity"
                      disabled={line.qty <= 1}
                      onClick={() => updateQty(line.menuItemId, Math.max(1, line.qty - 1))}
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                    <span className="qty-stepper-value">{line.qty}</span>
                    <button
                      type="button"
                      className="qty-stepper-btn"
                      aria-label="Increase quantity"
                      disabled={line.qty >= 99}
                      onClick={() => updateQty(line.menuItemId, Math.min(99, line.qty + 1))}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="customer-cart-remove"
                  onClick={() => removeLine(line.menuItemId)}
                >
                  Remove
                </button>
              </div>
            </article>
          )
        })}

        <div className="total-row">
          <span>Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>

        <h3 className="section-title">Optional contact (receipts & updates)</h3>
        <p className="hint">No account needed. Leave blank if you prefer. You can still order.</p>
        <label className="field-label">
          Mobile
          <input
            className="field"
            type="tel"
            name="phone"
            placeholder="+1 …"
            value={phone}
            onChange={(ev) => setPhone(ev.target.value)}
            autoComplete="tel"
          />
        </label>
        <label className="field-label">
          Email
          <input
            className="field"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            autoComplete="email"
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Submit order to kitchen'}
        </button>
      </form>

      <p className="hint" style={{ marginTop: 16 }}>
        <button type="button" className="ghost-btn" onClick={() => clearGuest()}>
          Clear table session
        </button>
      </p>
    </ScreenFrame>
  )
}

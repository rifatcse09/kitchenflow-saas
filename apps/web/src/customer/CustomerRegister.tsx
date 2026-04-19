import { Link } from 'react-router-dom'
import { ScreenFrame } from '../shared/components/ScreenFrame'

/**
 * Demo placeholder: real SaaS would POST a customer profile and tie phone/email to
 * cross-restaurant visit history. Today, use the seeded customer account on Login.
 */
export function CustomerRegister() {
  return (
    <ScreenFrame
      title="Create customer account"
      subtitle="Demo · one profile for visits across restaurants"
      frameClassName="customer-vibe-screen"
    >
      <p className="hint">
        In production, registering with <strong>email or mobile</strong> lets you reopen past orders from any
        restaurant you visited, and match receipts when you return on a new device.
      </p>
      <p className="hint">
        <strong>Try the seeded account now:</strong> open Log in and use <code>customer@demo.com</code> /{' '}
        <code>customer123</code>.
      </p>
      <Link to="/customer/login" className="primary-btn">
        Go to log in
      </Link>
      <p className="hint" style={{ marginTop: 16 }}>
        Restaurant owners sign up on the <Link to="/restaurant/register">restaurant portal</Link> (separate tenant).
      </p>
    </ScreenFrame>
  )
}

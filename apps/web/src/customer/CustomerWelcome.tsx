import { Link } from 'react-router-dom'
import { DEMO_RESTAURANT_ID, PRODUCT_NAME } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerWelcome() {
  const demoPath = `/customer/r/${DEMO_RESTAURANT_ID}/t/T12`

  return (
    <ScreenFrame
      title={PRODUCT_NAME}
      subtitle="Scan your table QR to open the menu and send orders to the kitchen—no app required."
      frameClassName="customer-vibe-screen"
    >
      <div className="customer-welcome-inner customer-welcome-inner--compact">
        <div className="customer-welcome-brand">
          <div className="customer-welcome-logo" aria-hidden>
            🍴
          </div>
        </div>
        <p className="customer-welcome-lead">
          Your session remembers the restaurant and table from the QR you scan. Use the links below to try the demo or
          jump straight in if you already scanned.
        </p>

        <div className="customer-welcome-actions">
          <Link to={demoPath} className="primary-btn">
            Try demo · Table T12
          </Link>
          <Link to="/customer/menu" className="ghost-btn customer-welcome-ghost-btn">
            I scanned open menu
          </Link>
        </div>

        <p className="customer-welcome-foot">
          <Link to="/customer/tracking">Order status</Link>
          <span className="customer-welcome-foot-sep" aria-hidden>
            ·
          </span>
          <Link to="/customer/cart">Cart</Link>
          <span className="customer-welcome-foot-sep" aria-hidden>
            ·
          </span>
          <Link to="/customer/login">Log in</Link>
          <span className="customer-welcome-foot-sep" aria-hidden>
            ·
          </span>
          <Link to="/customer/register">Register (demo)</Link>
        </p>
      </div>
    </ScreenFrame>
  )
}

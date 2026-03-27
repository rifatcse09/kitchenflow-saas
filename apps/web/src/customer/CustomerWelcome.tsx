import { Link } from 'react-router-dom'
import { DEMO_RESTAURANT_ID } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerWelcome() {
  const demoPath = `/customer/r/${DEMO_RESTAURANT_ID}/t/T12`

  return (
    <ScreenFrame
      title="BBQ on the Ave"
      subtitle="Scan the restaurant QR — no login required"
      frameClassName="customer-vibe-screen"
    >
      <div className="hero-banner customer-hero">
        <h2>Scan, browse, checkout</h2>
        <p>
          The QR code encodes this restaurant and your table. You can add optional phone or email on checkout for
          receipts or updates — no account needed.
        </p>
      </div>
      <p className="hint">
        <strong>Try the demo (dev):</strong>{' '}
        <Link to={demoPath}>Open as Table T12</Link> (uses seeded tenant id {DEMO_RESTAURANT_ID}).
      </p>
      <Link to="/customer/menu" className="primary-btn">
        I already scanned — go to menu
      </Link>
      <p className="hint" style={{ marginTop: 16 }}>
        Optional: <Link to="/customer/login">Customer login</Link> for saved preferences later.
      </p>
    </ScreenFrame>
  )
}

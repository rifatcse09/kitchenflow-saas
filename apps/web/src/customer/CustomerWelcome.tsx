import { Link } from 'react-router-dom'
import { DEMO_RESTAURANT_ID, PRODUCT_NAME } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerWelcome() {
  const demoPath = `/customer/r/${DEMO_RESTAURANT_ID}/t/T12`

  return (
    <ScreenFrame
      title={PRODUCT_NAME}
      subtitle="Order from your table in a few taps: no app to install. Made for guests, tourists, and anyone ordering for the first time."
      frameClassName="customer-vibe-screen"
    >
      <div className="customer-welcome-inner">
        <div className="customer-welcome-brand">
          <div className="customer-welcome-logo" aria-hidden>
            🍴
          </div>
          <p className="customer-welcome-tagline">
            Restaurants on {PRODUCT_NAME} place a <strong>QR code on your table</strong>. Scan it with your phone
            camera. You&apos;ll open <strong>that venue&apos;s menu</strong>, already tied to <strong>your table</strong>.
            Your choices go to the kitchen queue for this visit only, so nothing gets mixed up with other tables.
          </p>
        </div>

        <div className="customer-welcome-main">
          <div className="hero-banner customer-hero">
            <h2>Relax. We keep it simple</h2>
            <p>
              Most people never create an account: pick dishes, review your cart, then send the order to the kitchen.
              You can add a phone or email at checkout if you want a receipt or updates. Paying the bill can still
              happen with your server. This flow is mainly for <strong>ordering</strong> and{' '}
              <strong>seeing where your food is</strong> in the line.
            </p>
          </div>

          <section className="customer-welcome-panel" aria-labelledby="welcome-how-heading">
            <h3 id="welcome-how-heading" className="customer-welcome-section-title">
              How it works
            </h3>
            <ol className="customer-welcome-steps">
              <li>
                <strong>Scan the table QR</strong> (or use a link the staff shares). We save the restaurant and table
                for this browser session.
              </li>
              <li>
                <strong>Browse the menu</strong>: search or tap category chips if the list is long.
              </li>
              <li>
                <strong>Add items to your cart</strong>, open <strong>Cart &amp; checkout</strong>, adjust quantities,
                then submit to the kitchen.
              </li>
              <li>
                <strong>Follow along</strong> under <Link to="/customer/tracking">Order status</Link> to see progress
                for <em>this table&apos;s</em> visit at the restaurant you scanned.
              </li>
            </ol>
          </section>

          <section className="customer-welcome-panel customer-welcome-panel--soft" aria-labelledby="welcome-tips-heading">
            <h3 id="welcome-tips-heading" className="customer-welcome-section-title">
              Helpful to know
            </h3>
            <ul className="customer-welcome-tips">
              <li>
                <strong>Changing tables?</strong> Scan the new QR so orders and status stay with the right table.
              </li>
              <li>
                <strong>Closed the tab?</strong> Scan the same code again. It&apos;s your fastest way back to this
                restaurant&apos;s menu.
              </li>
              <li>
                <strong>Traveling or in a hurry?</strong> Guest checkout is fastest; an account is optional and mainly
                for demos today.
              </li>
            </ul>
          </section>

          <p className="hint">
            <strong>No physical QR handy?</strong> Try our seeded demo:{' '}
            <Link to={demoPath}>Table T12 · restaurant {DEMO_RESTAURANT_ID}</Link>. A full BBQ-style menu is loaded so
            you can explore the flow end-to-end.
          </p>

          <Link to="/customer/menu" className="primary-btn">
            I already scanned: open menu
          </Link>

          <p className="hint">
            <strong>Already ordered?</strong> Open <Link to="/customer/tracking">Order status</Link> from the menu
            (top-left) to watch your table&apos;s queue for the restaurant in your current session.
          </p>
        </div>

        <div className="customer-welcome-bottom">
          <p className="customer-welcome-account-hint">
            Optional: after you <Link to="/customer/register">register (demo)</Link>, you can{' '}
            <Link to="/customer/login">sign in</Link> so future visits can be linked to your profile when the platform
            supports it across restaurants.
          </p>
          <Link to="/customer/login" className="customer-btn-coral">
            Log in
          </Link>
          <Link to="/customer/register" className="customer-btn-outline">
            Create a demo account
          </Link>
          <Link to="/customer/tracking" className="customer-welcome-link-muted">
            Order status · this table&apos;s visit
          </Link>
        </div>
      </div>
    </ScreenFrame>
  )
}

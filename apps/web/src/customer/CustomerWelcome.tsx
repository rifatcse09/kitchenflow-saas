import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerWelcome() {
  return (
    <ScreenFrame title="BBQ on the Ave" subtitle="Table T12 detected from QR">
      <div className="hero-banner">
        <h2>Welcome, please place your order</h2>
        <p>Scan complete. You can now order directly to kitchen.</p>
      </div>
      <button className="primary-btn">Start Ordering</button>
    </ScreenFrame>
  )
}

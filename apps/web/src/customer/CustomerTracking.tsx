import { Link, useLocation } from 'react-router-dom'
import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerTracking() {
  const loc = useLocation()
  const orderId = (loc.state as { orderId?: number } | undefined)?.orderId

  return (
    <ScreenFrame
      title="Track your order"
      subtitle={orderId != null ? `Order #${orderId}` : 'Guest order'}
      frameClassName="customer-vibe-screen"
    >
      {orderId != null ? (
        <p className="hint">We’ve sent this order to the kitchen. Status updates can be wired to WebSockets next.</p>
      ) : (
        <p className="hint">Submit an order first, or open this page from your confirmation.</p>
      )}
      <div className="status-pill pending">Pending</div>
      <div className="timeline">
        <div className="timeline-item done">Order submitted</div>
        <div className="timeline-item active">Kitchen queue</div>
        <div className="timeline-item">Cooking</div>
        <div className="timeline-item">Ready</div>
      </div>
      <Link to="/customer/menu" className="primary-btn">
        Order something else
      </Link>
    </ScreenFrame>
  )
}

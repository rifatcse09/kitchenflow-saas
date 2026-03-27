import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerTracking() {
  return (
    <ScreenFrame title="Track Your Order" subtitle="Order #1024 • Table T12">
      <div className="status-pill pending">Pending</div>
      <div className="timeline">
        <div className="timeline-item done">Order Submitted</div>
        <div className="timeline-item done">Kitchen Accepted</div>
        <div className="timeline-item active">Cooking</div>
        <div className="timeline-item">Ready for Pickup / Delivery</div>
      </div>
      <button className="primary-btn">Refresh Status</button>
    </ScreenFrame>
  )
}

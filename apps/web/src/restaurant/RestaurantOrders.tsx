import { ScreenFrame } from '../shared/components/ScreenFrame'

export function RestaurantOrders() {
  return (
    <ScreenFrame title="Orders + Kitchen Queue" subtitle="Real-time order stream">
      <article className="queue-card">
        <div>
          <h4>Order #1024 • T12</h4>
          <p>Ribeye + Mash + Tea</p>
        </div>
        <span className="status-pill cooking">Cooking</span>
      </article>
      <article className="queue-card">
        <div>
          <h4>Order #1023 • T08</h4>
          <p>2x BBQ Plate + Cola</p>
        </div>
        <span className="status-pill ready">Ready</span>
      </article>
      <button className="primary-btn">Mark Selected as Ready</button>
    </ScreenFrame>
  )
}

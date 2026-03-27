import { ScreenFrame } from '../shared/components/ScreenFrame'

export function RestaurantOrderDetails() {
  return (
    <ScreenFrame title="Order Details #1024" subtitle="Dispute-safe order record">
      <div className="detail-grid">
        <p>
          <strong>Table:</strong> T12
        </p>
        <p>
          <strong>Status:</strong> Cooking
        </p>
        <p>
          <strong>Created:</strong> 6:21 PM
        </p>
        <p>
          <strong>Customer note:</strong> medium rare, no onions
        </p>
      </div>
      <div className="video-box">Audio / Video proof preview</div>
      <button className="primary-btn">Set Ready</button>
    </ScreenFrame>
  )
}

import { ScreenFrame } from '../shared/components/ScreenFrame'

export function AdminActivity() {
  return (
    <ScreenFrame title="System Activity" subtitle="Platform audit stream">
      <div className="timeline">
        <div className="timeline-item done">[18:02] Restaurant approved: Grill & Co</div>
        <div className="timeline-item done">[17:48] Order volume spike alert in tenant #R102</div>
        <div className="timeline-item active">[17:40] New onboarding request: Taco Rush Truck</div>
        <div className="timeline-item">[17:15] Subscription payment failed: Tenant #R081</div>
      </div>
      <button className="primary-btn">Refresh Activity</button>
    </ScreenFrame>
  )
}

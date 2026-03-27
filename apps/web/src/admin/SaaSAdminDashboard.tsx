import { ScreenFrame } from '../shared/components/ScreenFrame'

export function SaaSAdminDashboard({
  pendingCount,
  activeTenants,
}: {
  pendingCount: number
  activeTenants: number
}) {
  return (
    <ScreenFrame
      title="SaaS control center"
      subtitle="Super Admin — subscriptions, onboarding queue, tenant health (mock)"
    >
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Active tenants</h4>
          <p>{activeTenants}</p>
        </div>
        <div className="stat-card">
          <h4>Pending onboarding</h4>
          <p>{pendingCount}</p>
        </div>
        <div className="stat-card">
          <h4>Trials</h4>
          <p>3</p>
        </div>
        <div className="stat-card">
          <h4>Past-due</h4>
          <p>1</p>
        </div>
      </div>
      <h3 className="section-title">Tenant health</h3>
      <article className="list-item">
        <div>
          <h4>Smokey House BBQ</h4>
          <p>Active • last order 2m ago • KDS OK</p>
        </div>
        <span className="status-pill ready">Healthy</span>
      </article>
      <article className="list-item">
        <div>
          <h4>Taco Rush Truck</h4>
          <p>Quiet 6h • possible device offline</p>
        </div>
        <span className="status-pill pending">Watch</span>
      </article>
    </ScreenFrame>
  )
}

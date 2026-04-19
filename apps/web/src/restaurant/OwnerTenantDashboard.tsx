import { ScreenFrame } from '../shared/components/ScreenFrame'

export function OwnerTenantDashboard() {
  return (
    <ScreenFrame
      title="Owner dashboard"
      subtitle="Daily sales, popular items (tenant-scoped state)"
    >
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Net sales (today)</h4>
          <p>$3,240</p>
        </div>
        <div className="stat-card">
          <h4>Orders</h4>
          <p>86</p>
        </div>
        <div className="stat-card">
          <h4>Avg ticket</h4>
          <p>$37</p>
        </div>
        <div className="stat-card">
          <h4>Open disputes</h4>
          <p>1</p>
        </div>
      </div>
      <h3 className="section-title">Popular items</h3>
      <article className="list-item">
        <div>
          <h4>Ribeye Steak</h4>
          <p>32 sold</p>
        </div>
        <strong>↑</strong>
      </article>
      <article className="list-item">
        <div>
          <h4>Sweet Tea</h4>
          <p>64 sold</p>
        </div>
        <strong>↑</strong>
      </article>
    </ScreenFrame>
  )
}

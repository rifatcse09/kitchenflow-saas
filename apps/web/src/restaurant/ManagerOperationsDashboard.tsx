import { ScreenFrame } from '../shared/components/ScreenFrame'

export function ManagerOperationsDashboard() {
  return (
    <ScreenFrame title="Store operations" subtitle="Manager — shifts, availability, SLA (mock)">
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Shift orders</h4>
          <p>42</p>
        </div>
        <div className="stat-card">
          <h4>In kitchen</h4>
          <p>7</p>
        </div>
        <div className="stat-card">
          <h4>SLA risk</h4>
          <p>2</p>
        </div>
        <div className="stat-card">
          <h4>86’d items</h4>
          <p>0</p>
        </div>
      </div>
    </ScreenFrame>
  )
}

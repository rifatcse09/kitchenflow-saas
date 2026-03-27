import { ScreenFrame } from '../shared/components/ScreenFrame'

export function OrderHistoryPro({ tenantId }: { tenantId: number }) {
  return (
    <ScreenFrame title="Order history" subtitle={`tenant ${tenantId} • filterable (mock)`}>
      <div className="chips">
        <span className="chip active">Today</span>
        <span className="chip">Week</span>
        <span className="chip">Disputes</span>
      </div>
      <article className="list-item">
        <div>
          <h4>#1024 • T12</h4>
          <p>6:21 PM • $38 • audio</p>
        </div>
        <button className="ghost-btn" type="button">
          Open
        </button>
      </article>
      <article className="list-item">
        <div>
          <h4>#1023 • T08</h4>
          <p>6:05 PM • $24</p>
        </div>
        <button className="ghost-btn" type="button">
          Open
        </button>
      </article>
    </ScreenFrame>
  )
}

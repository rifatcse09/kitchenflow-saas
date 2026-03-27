import { PRODUCT_NAME } from '../shared/constants'

export function KitchenKDS({ tenantId }: { tenantId: number }) {
  return (
    <div className="kds-board">
      <header className="kds-board-head">
        <span>{PRODUCT_NAME} · Kitchen line</span>
        <span className="kds-muted">tenant_id {tenantId}</span>
      </header>
      <div className="kds-columns">
        <section className="kds-column">
          <h3>New</h3>
          <div className="kds-ticket">
            <div className="kds-ticket-top">#1025 • T03</div>
            <ul>
              <li>2× Burger</li>
              <li>Fries</li>
            </ul>
          </div>
        </section>
        <section className="kds-column">
          <h3>Cooking</h3>
          <div className="kds-ticket kds-ticket-active">
            <div className="kds-ticket-top">#1024 • T12</div>
            <ul>
              <li>Ribeye MR</li>
            </ul>
            <button className="primary-btn" type="button">
              Mark ready
            </button>
          </div>
        </section>
        <section className="kds-column">
          <h3>Ready</h3>
          <div className="kds-ticket kds-ticket-ready">
            <div className="kds-ticket-top">#1023 • T08</div>
            <p>Runner</p>
          </div>
        </section>
      </div>
    </div>
  )
}

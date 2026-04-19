import { Link } from 'react-router-dom'
import { ScreenFrame } from '../shared/components/ScreenFrame'

const SAMPLE_ORDERS = [
  { id: 1024, table: 'T12', time: '6:21 PM', total: 38, tags: 'Audio note' },
  { id: 1023, table: 'T08', time: '6:05 PM', total: 24, tags: 'Guest checkout' },
]

export function OrderHistoryPro({ tenantId }: { tenantId: number }) {
  return (
    <ScreenFrame
      title="Order history"
      subtitle={`Store #${tenantId} · review past guest checks from this location`}
      frameClassName="restaurant-portal-screen"
    >
      <p className="order-history-lead">
        Filter is a demo control; production would query your POS dates and dispute flags.
      </p>

      <div className="order-history-filters" role="tablist" aria-label="Date range">
        <button type="button" className="order-history-chip order-history-chip--active">
          Today
        </button>
        <button type="button" className="order-history-chip">
          This week
        </button>
        <button type="button" className="order-history-chip">
          Disputes
        </button>
      </div>

      <ul className="order-history-list">
        {SAMPLE_ORDERS.map((o) => (
          <li key={o.id} className="order-history-card">
            <div className="order-history-card-main">
              <span className="order-history-eyebrow">Guest order</span>
              <h3 className="order-history-title">
                #{o.id}
                <span className="order-history-title-sep" aria-hidden>
                  ·
                </span>
                <span className="order-history-table">Table {o.table}</span>
              </h3>
              <p className="order-history-meta">
                <span>{o.time}</span>
                <span className="order-history-meta-sep">·</span>
                <span className="order-history-amount">${o.total.toFixed(2)}</span>
                <span className="order-history-meta-sep">·</span>
                <span>{o.tags}</span>
              </p>
            </div>
            <div className="order-history-card-action">
              <Link to={`/restaurant/order/${o.id}`} className="order-history-open-btn">
                Open
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </ScreenFrame>
  )
}

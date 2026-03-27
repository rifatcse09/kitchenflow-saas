import { ScreenFrame } from '../shared/components/ScreenFrame'

export function SaaSBillingMock() {
  return (
    <ScreenFrame
      title="Billing"
      subtitle="Stripe / Paddle — paid status (mock; connect webhooks later)"
    >
      <article className="list-item">
        <div>
          <h4>Smokey House BBQ</h4>
          <p>Pro • $99/mo • Next renew Apr 12</p>
        </div>
        <strong>Paid</strong>
      </article>
      <article className="list-item">
        <div>
          <h4>Taco Rush Truck</h4>
          <p>Trial • 5 days left</p>
        </div>
        <strong>$0</strong>
      </article>
      <button className="primary-btn" type="button">
        Open billing provider
      </button>
    </ScreenFrame>
  )
}

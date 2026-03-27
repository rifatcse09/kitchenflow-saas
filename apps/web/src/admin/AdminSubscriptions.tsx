import { ScreenFrame } from '../shared/components/ScreenFrame'

export function AdminSubscriptions() {
  return (
    <ScreenFrame title="Subscriptions & Licensing" subtitle="Manage billing plans and license status">
      <article className="list-item">
        <div>
          <h4>Smokey House BBQ</h4>
          <p>Pro Plan • Active • Next bill Apr 01</p>
        </div>
        <strong>$99</strong>
      </article>
      <article className="list-item">
        <div>
          <h4>Taco Rush Truck</h4>
          <p>Starter Plan • Trial • Ends in 5 days</p>
        </div>
        <strong>$0</strong>
      </article>
      <button className="primary-btn">Open Billing Settings</button>
    </ScreenFrame>
  )
}

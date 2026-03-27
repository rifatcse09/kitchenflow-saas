import { demoMenuItems } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerMenu() {
  return (
    <ScreenFrame title="Digital Menu" subtitle="Choose items and add special notes">
      <div className="chips">
        <span className="chip active">Steaks</span>
        <span className="chip">Appetizers</span>
        <span className="chip">Drinks</span>
        <span className="chip">Desserts</span>
      </div>
      {demoMenuItems.map((item) => (
        <article key={item.name} className="list-item">
          <div>
            <h4>{item.name}</h4>
            <p>{item.description}</p>
            <small>+ Add note</small>
          </div>
          <strong>${item.price}</strong>
        </article>
      ))}
      <button className="primary-btn">View Order ($39)</button>
    </ScreenFrame>
  )
}

import { demoOrderItems } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerCart() {
  return (
    <ScreenFrame title="Review Order" subtitle="Table T12 • Order draft">
      {demoOrderItems.map((item) => (
        <article key={item.name} className="list-item">
          <div>
            <h4>
              {item.qty}x {item.name}
            </h4>
            <p>{item.note ?? 'No special notes'}</p>
          </div>
          <strong>${item.price}</strong>
        </article>
      ))}
      <div className="total-row">
        <span>Total</span>
        <strong>$39</strong>
      </div>
      <button className="primary-btn">Submit Order</button>
    </ScreenFrame>
  )
}

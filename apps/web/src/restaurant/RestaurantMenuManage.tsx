import type { FormEvent } from 'react'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import type { MenuItem } from '../shared/types'

export function RestaurantMenuManage({
  items,
  onAddMenuItem,
  canEditAll = true,
}: {
  items: MenuItem[]
  onAddMenuItem: (item: MenuItem) => Promise<void>
  canEditAll?: boolean
}) {
  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await onAddMenuItem({
      name: String(form.get('itemName') ?? ''),
      description: `${String(form.get('category') ?? '')} • Available`,
      price: Number(form.get('price') ?? 0),
    })
    event.currentTarget.reset()
  }

  return (
    <ScreenFrame
      title="Menu manager"
      subtitle={
        canEditAll
          ? 'List view, image placeholders, edit/delete ready for API wiring'
          : 'Shift view: toggle item availability (full edit restricted to owner)'
      }
    >
      {canEditAll ? (
        <form onSubmit={handleAddItem} className="inline-form">
          <input className="field" name="itemName" placeholder="Menu item name" required />
          <input className="field" name="category" placeholder="Category (Steaks, Drinks)" required />
          <input className="field" name="price" placeholder="Price" type="number" min="1" required />
          <button className="primary-btn" type="submit">
            + Add menu item
          </button>
        </form>
      ) : (
        <p className="hint">Manager mode: use Available toggle per row (mock).</p>
      )}

      {items.map((item) => (
        <article className="list-item menu-row" key={`${item.name}-${item.price}`}>
          <div className="menu-thumb" aria-hidden />
          <div className="item-main">
            <h4>{item.name}</h4>
            <p>{item.description}</p>
            {canEditAll ? <small>Edit / Delete (API)</small> : null}
          </div>
          <div className="menu-row-actions">
            <strong>${item.price}</strong>
            <label className="toggle">
              <input type="checkbox" defaultChecked /> Available
            </label>
          </div>
        </article>
      ))}
    </ScreenFrame>
  )
}

import type { FormEvent } from 'react'
import { useState } from 'react'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import { MENU_FOOD_IMAGE_KEYS, menuFoodImageSrc } from '../shared/constants'
import type { MenuItem } from '../shared/types'

function rowCategory(item: MenuItem) {
  return item.category ?? item.description.split('•')[0]?.trim() ?? ''
}

export function RestaurantMenuManage({
  items,
  onAddMenuItem,
  onUpdateItem,
  onRemoveItem,
  mode,
}: {
  items: MenuItem[]
  onAddMenuItem: (item: MenuItem) => Promise<void>
  onUpdateItem: (
    menuItemId: number,
    payload: { name: string; category: string; price: number; available: boolean; imageKey?: string | null },
  ) => Promise<void>
  onRemoveItem: (menuItemId: number) => Promise<string | undefined>
  mode: 'manage' | 'view'
}) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editAvailable, setEditAvailable] = useState(true)
  const [editImageKey, setEditImageKey] = useState('default')
  const [rowBusy, setRowBusy] = useState<number | null>(null)
  const [formError, setFormError] = useState('')

  const manage = mode === 'manage'

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setFormError('')
    try {
      const ik = String(form.get('imageKey') ?? '').trim() || 'default'
      await onAddMenuItem({
        name: String(form.get('itemName') ?? ''),
        description: `${String(form.get('category') ?? '')} • Available`,
        price: Number(form.get('price') ?? 0),
        category: String(form.get('category') ?? ''),
        available: true,
        imageKey: ik,
      })
      event.currentTarget.reset()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not add item')
    }
  }

  function startEdit(item: MenuItem) {
    if (!item.id) return
    setEditingId(item.id)
    setEditName(item.name)
    setEditCategory(rowCategory(item))
    setEditPrice(String(item.price))
    setEditAvailable(item.available !== false)
    setEditImageKey(item.imageKey && item.imageKey !== '' ? item.imageKey : 'default')
  }

  async function saveEdit() {
    if (editingId == null) return
    const price = Number(editPrice)
    if (!editName.trim() || !editCategory.trim() || Number.isNaN(price) || price < 0) {
      setFormError('Name, category, and a valid price are required.')
      return
    }
    setFormError('')
    setRowBusy(editingId)
    try {
      await onUpdateItem(editingId, {
        name: editName.trim(),
        category: editCategory.trim(),
        price,
        available: editAvailable,
        imageKey: editImageKey,
      })
      setEditingId(null)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setRowBusy(null)
    }
  }

  async function toggleAvailable(item: MenuItem) {
    if (!item.id || !manage) return
    const next = item.available === false
    setRowBusy(item.id)
    try {
      await onUpdateItem(item.id, {
        name: item.name,
        category: rowCategory(item),
        price: item.price,
        available: next,
        imageKey: item.imageKey ?? null,
      })
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setRowBusy(null)
    }
  }

  async function removeRow(item: MenuItem) {
    if (!item.id || !manage) return
    if (!window.confirm(`Remove “${item.name}” from the menu?`)) return
    setRowBusy(item.id)
    try {
      const msg = await onRemoveItem(item.id)
      if (msg) window.alert(msg)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setRowBusy(null)
    }
  }

  return (
    <ScreenFrame
      title="Menu manager"
      subtitle={
        manage
          ? 'Owner and store manager: add, edit, delete dishes (API-backed). Kitchen staff see a read-only list below.'
          : 'Kitchen view: browse the menu. Changes are made by the owner or manager.'
      }
      frameClassName="restaurant-portal-screen"
    >
      {formError ? <p className="error-text">{formError}</p> : null}

      {manage ? (
        <form onSubmit={handleAddItem} className="inline-form menu-add-form">
          <input className="field" name="itemName" placeholder="Menu item name" required />
          <input className="field" name="category" placeholder="Category (Steaks, Drinks)" required />
          <input className="field" name="price" placeholder="Price" type="number" min="0" step="0.01" required />
          <label className="field-label menu-add-image-label">
            Menu image
            <select className="field" name="imageKey" defaultValue="default">
              {MENU_FOOD_IMAGE_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-btn" type="submit">
            + Add menu item
          </button>
        </form>
      ) : (
        <p className="hint">You can review dishes and prices here. Ask a manager to change the menu.</p>
      )}

      {items.map((item) => {
        const id = item.id
        const busy = id != null && rowBusy === id
        const editing = manage && id != null && editingId === id

        return (
          <article className="list-item menu-row" key={id ?? `${item.name}-${item.price}`}>
            <img
              className="menu-thumb-img"
              src={menuFoodImageSrc(item.imageKey)}
              alt=""
              width={56}
              height={56}
              loading="lazy"
            />
            <div className="item-main">
              {editing ? (
                <div className="menu-edit-block">
                  <label className="field-label">
                    Name
                    <input className="field" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </label>
                  <label className="field-label">
                    Category
                    <input className="field" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                  </label>
                  <label className="field-label">
                    Price
                    <input
                      className="field"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                  </label>
                  <label className="toggle menu-edit-available">
                    <input
                      type="checkbox"
                      checked={editAvailable}
                      onChange={(e) => setEditAvailable(e.target.checked)}
                    />
                    Available on menu
                  </label>
                  <label className="field-label">
                    Menu image
                    <select
                      className="field"
                      value={editImageKey}
                      onChange={(e) => setEditImageKey(e.target.value)}
                    >
                      {MENU_FOOD_IMAGE_KEYS.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="menu-edit-actions">
                    <button type="button" className="primary-btn" disabled={busy} onClick={() => void saveEdit()}>
                      {busy ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" className="ghost-btn" disabled={busy} onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  {manage && id != null ? <small>Edit details or remove this dish.</small> : null}
                </>
              )}
            </div>
            {!editing ? (
              <div className="menu-row-actions">
                <strong>${item.price % 1 === 0 ? item.price.toFixed(0) : item.price.toFixed(2)}</strong>
                {manage && id != null ? (
                  <>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={item.available !== false}
                        disabled={busy}
                        onChange={() => void toggleAvailable(item)}
                      />
                      Available
                    </label>
                    <div className="menu-row-btn-row">
                      <button type="button" className="ghost-btn" disabled={busy} onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="ghost-btn" disabled={busy} onClick={() => void removeRow(item)}>
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <span className={`menu-availability-pill${item.available === false ? ' menu-availability-pill--off' : ''}`}>
                    {item.available === false ? 'Unavailable' : 'On menu'}
                  </span>
                )}
              </div>
            ) : null}
          </article>
        )
      })}
    </ScreenFrame>
  )
}

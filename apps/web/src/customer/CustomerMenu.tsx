import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, menuFoodImageSrc } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import { useCustomerGuest } from './useCustomerGuest'

type ApiMenuItem = {
  id: number
  name: string
  category: string
  price: number
  available: boolean
  imageKey?: string | null
}

export function CustomerMenu() {
  const { session, addToCart, cart } = useCustomerGuest()
  const [items, setItems] = useState<ApiMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const menuScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    menuScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [category])

  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/restaurant/${session.restaurantId}/menu-items`)
        if (!res.ok) throw new Error('Menu unavailable')
        const data = (await res.json()) as ApiMenuItem[]
        if (!cancelled) setItems(data.filter((i) => i.available))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load menu')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session])

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  const filtered = useMemo(() => {
    if (category === 'all') return items
    return items.filter((i) => i.category === category)
  }, [items, category])

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return filtered
    return filtered.filter(
      (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q),
    )
  }, [filtered, searchQuery])

  const searchTrimmed = searchQuery.trim().toLowerCase()

  const menuSections = useMemo(() => {
    if (visibleItems.length === 0) return []
    if (category !== 'all') {
      return [{ label: category, items: visibleItems }]
    }
    const m = new Map<string, ApiMenuItem[]>()
    for (const item of visibleItems) {
      const arr = m.get(item.category) ?? []
      arr.push(item)
      m.set(item.category, arr)
    }
    return Array.from(m.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, sectionItems]) => ({ label, items: sectionItems }))
  }, [category, visibleItems])

  if (!session) {
    return (
      <ScreenFrame title="Scan a table QR" subtitle="No login required" frameClassName="customer-vibe-screen">
        <p className="hint">
          Scan the QR code at your table to open this restaurant’s menu. It encodes the restaurant and your table
          number.
        </p>
        <p className="hint">
          Demo link (dev):{' '}
          <Link to="/customer/r/1/t/T12">Open menu as Table T12 · Restaurant 1</Link>
        </p>
      </ScreenFrame>
    )
  }

  if (loading) {
    return (
      <ScreenFrame
        title="Menu"
        subtitle={`${session.restaurantName ?? 'Restaurant'} · ${session.tableCode}`}
        frameClassName="customer-vibe-screen"
      >
        <div className="customer-menu-skeleton" aria-busy="true" aria-label="Loading menu">
          <div className="customer-menu-skeleton-row" />
          <div className="customer-menu-skeleton-row" />
          <div className="customer-menu-skeleton-row" />
          <div className="customer-menu-skeleton-row" />
        </div>
      </ScreenFrame>
    )
  }

  if (error) {
    return (
      <ScreenFrame title="Menu" subtitle={`Table ${session.tableCode}`} frameClassName="customer-vibe-screen">
        <p className="error-text">{error}</p>
      </ScreenFrame>
    )
  }

  const cartCount = cart.reduce((s, l) => s + l.qty, 0)
  const subtitleParts = [`Table ${session.tableCode}`]
  if (searchTrimmed) {
    subtitleParts.push(`${visibleItems.length} match${visibleItems.length === 1 ? '' : 'es'}`)
  } else if (category === 'all') {
    subtitleParts.push(`${items.length} dishes`)
  } else {
    subtitleParts.push(`${visibleItems.length} in ${category}`)
  }

  return (
    <ScreenFrame
      title={session.restaurantName ?? 'Menu'}
      subtitle={subtitleParts.join(' · ')}
      frameClassName="customer-vibe-screen"
    >
        <div className="customer-menu-stack">
          <div ref={menuScrollRef} className="customer-menu-scroll">
            <div className="customer-menu-top">
              <label className="customer-menu-search">
                <span className="sr-only">Search menu by dish name or category</span>
                <input
                  type="search"
                  className="customer-menu-search-input"
                  placeholder="Search dishes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="search"
                />
              </label>

              <div className="chips vibe-tabs customer-menu-chips" role="tablist" aria-label="Menu categories">
                <button
                  type="button"
                  role="tab"
                  aria-selected={category === 'all'}
                  className={`chip chip-btn${category === 'all' ? ' active' : ''}`}
                  onClick={() => setCategory('all')}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={category === cat}
                    className={`chip chip-btn${category === cat ? ' active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {visibleItems.length === 0 ? (
              <div className="customer-menu-list">
                <p className="hint">
                  {filtered.length === 0
                    ? 'No dishes in this category right now.'
                    : `No dishes match “${searchQuery.trim()}”. Try another search or category.`}
                </p>
              </div>
            ) : (
              menuSections.map((section) => (
                <section key={section.label} className="customer-menu-category-block">
                  <h3 className="customer-category-heading">{section.label}</h3>
                  <div className="customer-menu-list">
                    {section.items.map((item) => (
                      <article key={item.id} className="list-item customer-menu-item menu-row">
                        <img
                          className="menu-food-thumb menu-food-thumb-img"
                          src={menuFoodImageSrc(item.imageKey)}
                          alt=""
                          loading="lazy"
                          width={62}
                          height={62}
                        />
                        <div className="item-main">
                          <h4>{item.name}</h4>
                          <p>{item.category}</p>
                          <small>Add a note at checkout · pit-smoked when listed</small>
                        </div>
                        <div className="menu-row-actions">
                          <strong>${item.price % 1 === 0 ? item.price.toFixed(0) : item.price.toFixed(2)}</strong>
                          <button
                            type="button"
                            className="ghost-btn customer-add-cart-btn"
                            onClick={() =>
                              addToCart({
                                menuItemId: item.id,
                                name: item.name,
                                price: item.price,
                                qty: 1,
                              })
                            }
                          >
                            Add to cart
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>

          <div className="customer-menu-dock customer-menu-dock--fixed">
            <Link to="/customer/tracking" className="customer-menu-dock-status">
              Order status
            </Link>
            <Link to="/customer/cart" className="customer-menu-dock-cart">
              <span>View cart</span>
              <strong>
                {cartCount} item{cartCount === 1 ? '' : 's'}
              </strong>
            </Link>
          </div>
        </div>
    </ScreenFrame>
  )
}

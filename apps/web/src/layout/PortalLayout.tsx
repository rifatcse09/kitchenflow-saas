import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { PRODUCT_NAME } from '../shared/constants'
import type { NavLinkItem } from '../shared/types'

function NavItem({ to, label, onNavigate }: { to: string; label: string; onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      onClick={onNavigate}
    >
      {label}
    </NavLink>
  )
}

function navActiveIndex(pathname: string, items: NavLinkItem[]): number {
  let best = -1
  let bestLen = -1
  items.forEach((item, i) => {
    const path = item.to
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      if (path.length > bestLen) {
        best = i
        bestLen = path.length
      }
    }
  })
  return best
}

export function PortalLayout({
  portal,
  description,
  isAuthenticated,
  layoutVariant = 'sidebar',
  tenantLabel,
  navItems,
  navigationPresentation = 'sidebar',
  showPortalSwitcher = true,
  children,
}: {
  portal: string
  description: string
  isAuthenticated: boolean
  layoutVariant?: 'sidebar' | 'kitchen-top'
  tenantLabel?: string
  navItems: NavLinkItem[]
  /** Customer: always hamburger + drawer (no desktop sidebar column). */
  navigationPresentation?: 'sidebar' | 'drawer-always'
  /** When false, hide Restaurant / Admin links (signed-in customer app shell). */
  showPortalSwitcher?: boolean
  children: ReactNode
}) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const drawerAlways = navigationPresentation === 'drawer-always'
  const useDrawerShell = !isAuthenticated || drawerAlways

  const navIdx = useMemo(
    () => (drawerAlways ? navActiveIndex(location.pathname, navItems) : -1),
    [drawerAlways, location.pathname, navItems],
  )
  const prevNav = drawerAlways && navIdx > 0 ? navItems[navIdx - 1] : null
  const nextNav = drawerAlways && navIdx >= 0 && navIdx < navItems.length - 1 ? navItems[navIdx + 1] : null

  if (layoutVariant === 'kitchen-top') {
    return (
      <div className="kds-app theme-kds">
        <header className="kds-topbar">
          <div className="kds-brand">
            <strong className="kds-product-name">{PRODUCT_NAME}</strong>
            <span className="kds-muted">{portal}</span>
            {tenantLabel ? <span className="kds-tenant">{tenantLabel}</span> : null}
          </div>
          <nav className="kds-topnav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `kds-nav-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="kds-main">{children}</main>
      </div>
    )
  }

  if (useDrawerShell) {
    const closeNav = () => setSidebarOpen(false)
    const asideId = !isAuthenticated ? 'portal-guest-nav' : 'portal-sidebar-nav'
    const shellClass = [
      'app-shell',
      'no-sidebar',
      'theme-minimal',
      !isAuthenticated ? 'guest-portal-mobile' : '',
      drawerAlways ? 'portal-nav-drawer-only customer-portal-shell' : '',
      sidebarOpen ? 'sidebar-open' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <main className={shellClass}>
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          tabIndex={sidebarOpen ? 0 : -1}
          onClick={closeNav}
        />

        <aside id={asideId} className="sidebar" aria-label="Navigation">
          <h1 className="brand-mark">{PRODUCT_NAME}</h1>
          <p className="sidebar-tagline">{description}</p>
          {isAuthenticated ? (
            <>
              <div className="portal-badge">{portal}</div>
              {tenantLabel ? <div className="tenant-chip">{tenantLabel}</div> : null}
            </>
          ) : null}

          <div className="nav-group">
            <h3>Navigation</h3>
            {navItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} onNavigate={closeNav} />
            ))}
          </div>

          {showPortalSwitcher ? (
            <div className="nav-group">
              <h3>Switch portal</h3>
              <NavItem to="/customer/welcome" label="Customer" onNavigate={closeNav} />
              <NavItem to="/restaurant/login" label="Restaurant" onNavigate={closeNav} />
              <NavItem to="/admin/login" label="SaaS admin" onNavigate={closeNav} />
            </div>
          ) : null}
        </aside>

        <div className="portal-main">
          <header
            className={`mobile-portal-topbar${drawerAlways ? ' mobile-portal-topbar--with-arrows' : ''}`}
          >
            <button
              type="button"
              className="mobile-nav-toggle"
              aria-expanded={sidebarOpen}
              aria-controls={asideId}
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setSidebarOpen((open) => !open)}
            >
              <span className="mobile-nav-toggle-bars" aria-hidden />
            </button>
            {drawerAlways ? (
              prevNav ? (
                <Link
                  className="mobile-portal-arrow"
                  to={prevNav.to}
                  aria-label={`Previous: ${prevNav.label}`}
                  onClick={closeNav}
                >
                  ‹
                </Link>
              ) : (
                <span className="mobile-portal-topbar-spacer" aria-hidden="true" />
              )
            ) : null}
            <div className="mobile-portal-topbar-text">
              <strong>{PRODUCT_NAME}</strong>
              <span>{portal}</span>
            </div>
            {drawerAlways ? (
              nextNav ? (
                <Link
                  className="mobile-portal-arrow"
                  to={nextNav.to}
                  aria-label={`Next: ${nextNav.label}`}
                  onClick={closeNav}
                >
                  ›
                </Link>
              ) : (
                <span className="mobile-portal-topbar-spacer" aria-hidden="true" />
              )
            ) : null}
          </header>
          <section className="screen-container">{children}</section>
        </div>
      </main>
    )
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <main className={`app-shell theme-minimal${sidebarOpen ? ' sidebar-open' : ''}`}>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close menu"
        tabIndex={sidebarOpen ? 0 : -1}
        onClick={closeSidebar}
      />

      <aside id="portal-sidebar-nav" className="sidebar" aria-label="Main navigation">
        <h1 className="brand-mark">{PRODUCT_NAME}</h1>
        <p className="sidebar-tagline">{description}</p>
        <div className="portal-badge">{portal}</div>
        {tenantLabel ? <div className="tenant-chip">{tenantLabel}</div> : null}

        <div className="nav-group">
          <h3>Navigation</h3>
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} onNavigate={closeSidebar} />
          ))}
        </div>

        <div className="nav-group">
          <h3>Switch portal</h3>
          <NavItem to="/customer/welcome" label="Customer" onNavigate={closeSidebar} />
          <NavItem to="/restaurant/login" label="Restaurant" onNavigate={closeSidebar} />
          <NavItem to="/admin/login" label="SaaS admin" onNavigate={closeSidebar} />
        </div>
      </aside>

      <div className="portal-main">
        <header className="mobile-portal-topbar">
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-expanded={sidebarOpen}
            aria-controls="portal-sidebar-nav"
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <span className="mobile-nav-toggle-bars" aria-hidden />
          </button>
          <div className="mobile-portal-topbar-text">
            <strong>{PRODUCT_NAME}</strong>
            <span>{portal}</span>
          </div>
        </header>
        <section className="screen-container">{children}</section>
      </div>
    </main>
  )
}

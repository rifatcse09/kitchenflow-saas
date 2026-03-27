import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { PRODUCT_NAME } from '../shared/constants'
import type { NavLinkItem } from '../shared/types'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      {label}
    </NavLink>
  )
}

export function PortalLayout({
  portal,
  description,
  isAuthenticated,
  layoutVariant = 'sidebar',
  tenantLabel,
  navItems,
  children,
}: {
  portal: string
  description: string
  isAuthenticated: boolean
  layoutVariant?: 'sidebar' | 'kitchen-top'
  tenantLabel?: string
  navItems: NavLinkItem[]
  children: ReactNode
}) {
  if (!isAuthenticated) {
    return (
      <main className="app-shell no-sidebar theme-minimal">
        <section className="screen-container">{children}</section>
      </main>
    )
  }

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

  return (
    <main className="app-shell theme-minimal">
      <aside className="sidebar">
        <h1 className="brand-mark">{PRODUCT_NAME}</h1>
        <p>{description}</p>
        <div className="portal-badge">{portal}</div>
        {tenantLabel ? <div className="tenant-chip">{tenantLabel}</div> : null}

        <div className="nav-group">
          <h3>Navigation</h3>
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} />
          ))}
        </div>

        <div className="nav-group">
          <h3>Switch portal</h3>
          <NavItem to="/customer/welcome" label="Customer" />
          <NavItem to="/restaurant/login" label="Restaurant" />
          <NavItem to="/admin/login" label="SaaS admin" />
        </div>
      </aside>

      <section className="screen-container">{children}</section>
    </main>
  )
}

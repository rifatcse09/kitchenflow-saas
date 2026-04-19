import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import './customer/customer-dark-theme.css'
import {
  AdminActivity,
  AdminLogin,
  AdminRestaurants,
  AdminSubscriptions,
  AdminBillingPayments,
  AdminSignOut,
  SaaSAdminDashboard,
} from './admin'
import {
  CustomerCart,
  CustomerGuestProvider,
  CustomerLogin,
  CustomerMenu,
  CustomerQrEntry,
  CustomerRecordAudio,
  CustomerRecordVideo,
  CustomerRegister,
  CustomerSignOut,
  CustomerTracking,
  CustomerWelcome,
} from './customer'
import { PortalLayout } from './layout/PortalLayout'
import { RestaurantIndexRedirect } from './layout/RestaurantIndexRedirect'
import { API_BASE, DEMO_RESTAURANT_ID } from './shared/constants'
import type {
  AuthResponse,
  AuthUser,
  LoginRole,
  MenuItem,
  NavLinkItem,
  PlatformOwner,
  RestaurantRequest,
  RestaurantRequestsPage,
  RestaurantSignupPayload,
  RestaurantTeamUser,
} from './shared/types'
import {
  KitchenKDS,
  OrderHistoryPro,
  OwnerLiveTablesMap,
  OwnerMediaReview,
  OwnerOnboardingWizard,
  RestaurantLogin,
  RestaurantMenuManage,
  RestaurantOrderDetails,
  RestaurantOrders,
  RestaurantQrCodes,
  RestaurantRegister,
  RestaurantRoleDashboard,
  RestaurantSignOut,
  RestaurantSubscription,
  RestaurantTeamUsers,
} from './restaurant'

function App() {
  const location = useLocation()
  const [restaurantRequests, setRestaurantRequests] = useState<RestaurantRequest[]>([])
  const [restaurantMeta, setRestaurantMeta] = useState({ pendingCount: 0, approvedCount: 0 })
  const [restaurantCatalogTick, setRestaurantCatalogTick] = useState(0)
  const [restaurantMenu, setRestaurantMenu] = useState<MenuItem[]>([])
  const [restaurantUsers, setRestaurantUsers] = useState<RestaurantTeamUser[]>([])
  const [platformOwner, setPlatformOwner] = useState<PlatformOwner>({
    email: 'admin@mdrifatul.info',
    name: 'Rifat Owner',
    passwordHint: '123456',
  })
  const [authState, setAuthState] = useState<{
    customer?: AuthUser
    restaurant?: AuthUser
    admin?: AuthUser
  }>({})

  const activeTenantId = authState.restaurant?.tenantId ?? DEMO_RESTAURANT_ID
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isRestaurantRoute = location.pathname.startsWith('/restaurant')

  async function refreshAdminCatalog() {
    const ownerRes = await fetch(`${API_BASE}/admin/default-owner`)

    if (ownerRes.ok) {
      const ownerData = (await ownerRes.json()) as PlatformOwner
      setPlatformOwner(ownerData)
    }

    const all: RestaurantRequest[] = []
    let meta = { pendingCount: 0, approvedCount: 0 }
    let cursor: number | undefined
    const pageSize = 50
    for (;;) {
      const qs = new URLSearchParams({ limit: String(pageSize) })
      if (cursor != null) qs.set('cursor', String(cursor))
      const requestsRes = await fetch(`${API_BASE}/admin/restaurant-requests?${qs}`)
      if (!requestsRes.ok) break
      const page = (await requestsRes.json()) as RestaurantRequestsPage
      meta = { pendingCount: page.pendingCount, approvedCount: page.approvedCount }
      all.push(...page.items)
      if (page.nextCursor == null) break
      cursor = page.nextCursor
      if (all.length > 2000) break
    }
    setRestaurantMeta(meta)
    setRestaurantRequests(all)
  }

  async function refreshTenantData(tenantId: number) {
    const [menuRes, usersRes] = await Promise.all([
      fetch(`${API_BASE}/restaurant/${tenantId}/menu-items`),
      fetch(`${API_BASE}/restaurant/${tenantId}/users`),
    ])

    if (menuRes.ok) {
      const menuData = (await menuRes.json()) as Array<{
        id: number
        name: string
        category: string
        price: number
        available: boolean
        imageKey?: string | null
      }>
      setRestaurantMenu(
        menuData.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          available: item.available,
          description: `${item.category} • ${item.available ? 'Available' : 'Unavailable'}`,
          price: item.price,
          imageKey: item.imageKey ?? null,
        })),
      )
    }

    if (usersRes.ok) {
      const usersData = (await usersRes.json()) as RestaurantTeamUser[]
      setRestaurantUsers(usersData)
    }
  }

  useEffect(() => {
    if (!isRestaurantRoute) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate menu/users when tenant changes
    void refreshTenantData(activeTenantId)
  }, [activeTenantId, isRestaurantRoute])

  useEffect(() => {
    if (!isAdminRoute) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate admin catalog on app load
    void refreshAdminCatalog()
  }, [isAdminRoute])

  const pendingCount = restaurantMeta.pendingCount

  async function submitRestaurantRegistration(payload: RestaurantSignupPayload) {
    await fetch(`${API_BASE}/restaurant/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await refreshAdminCatalog()
    setRestaurantCatalogTick((t) => t + 1)
    await refreshTenantData(activeTenantId)
  }

  async function addRestaurantUser(payload: {
    name: string
    email: string
    role: 'MANAGER' | 'STAFF' | 'CASHIER'
    password: string
  }) {
    const response = await fetch(`${API_BASE}/restaurant/${activeTenantId}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const maybeJson = await response.json().catch(() => null)
      const message = (maybeJson as { message?: string } | null)?.message
      throw new Error(message ?? `Create user failed (${response.status})`)
    }

    await refreshTenantData(activeTenantId)
  }

  async function approveRestaurantRequest(id: number) {
    await fetch(`${API_BASE}/admin/restaurant-requests/${id}/approve`, {
      method: 'PATCH',
    })
    await refreshAdminCatalog()
    setRestaurantCatalogTick((t) => t + 1)
    await refreshTenantData(activeTenantId)
  }

  async function addMenuItem(item: MenuItem) {
    const category = (item.category ?? item.description.split('•')[0]?.trim()) || 'General'
    await fetch(`${API_BASE}/restaurant/${activeTenantId}/menu-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: item.name,
        category,
        price: item.price,
        imageKey: item.imageKey ?? undefined,
      }),
    })
    await refreshTenantData(activeTenantId)
  }

  async function updateMenuItem(
    menuItemId: number,
    payload: { name: string; category: string; price: number; available: boolean; imageKey?: string | null },
  ) {
    const res = await fetch(`${API_BASE}/restaurant/${activeTenantId}/menu-items/${menuItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => null)
      const msg = (j as { message?: string } | null)?.message
      throw new Error(msg ?? `Update failed (${res.status})`)
    }
    await refreshTenantData(activeTenantId)
  }

  async function removeMenuItem(menuItemId: number): Promise<string | undefined> {
    const res = await fetch(`${API_BASE}/restaurant/${activeTenantId}/menu-items/${menuItemId}`, {
      method: 'DELETE',
    })
    const data = (await res.json().catch(() => ({}))) as { message?: string }
    if (!res.ok) {
      throw new Error(data.message ?? `Delete failed (${res.status})`)
    }
    await refreshTenantData(activeTenantId)
    return data.message
  }

  async function login(role: LoginRole, email: string, password: string): Promise<AuthUser> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, email, password }),
    })

    if (!response.ok) {
      const maybeJson = await response.json().catch(() => null)
      const message = (maybeJson as { message?: string } | null)?.message
      throw new Error(message ?? `Login failed (${response.status})`)
    }

    const data = (await response.json()) as AuthResponse
    if (role === 'CUSTOMER') {
      setAuthState((prev) => ({ ...prev, customer: data.user }))
    } else if (role === 'RESTAURANT') {
      setAuthState((prev) => ({ ...prev, restaurant: data.user }))
    } else {
      setAuthState((prev) => ({ ...prev, admin: data.user }))
    }
    return data.user
  }

  const clearCustomerAuth = useCallback(() => {
    setAuthState((prev) => ({ ...prev, customer: undefined }))
  }, [])

  const clearRestaurantAuth = useCallback(() => {
    setAuthState((prev) => ({ ...prev, restaurant: undefined }))
  }, [])

  const clearAdminAuth = useCallback(() => {
    setAuthState((prev) => ({ ...prev, admin: undefined }))
  }, [])

  const customerNavItems = useMemo((): NavLinkItem[] => {
    if (authState.customer) {
      return [
        { to: '/customer/welcome', label: 'Home' },
        { to: '/customer/menu', label: 'Menu' },
        { to: '/customer/cart', label: 'Cart' },
        { to: '/customer/tracking', label: 'Orders' },
        { to: '/customer/sign-out', label: 'Sign out' },
      ]
    }
    return [
      { to: '/customer/welcome', label: 'Home' },
      { to: '/customer/menu', label: 'Menu' },
      { to: '/customer/cart', label: 'Cart' },
      { to: '/customer/tracking', label: 'Orders' },
      { to: '/customer/login', label: 'Log in' },
      { to: '/customer/register', label: 'Register' },
    ]
  }, [authState.customer])

  const customerPortalDescription = authState.customer
    ? 'Signed in · browse menu and track orders'
    : 'Scan QR · order without an account'

  const restaurantNav = useMemo((): NavLinkItem[] => {
    const sub = authState.restaurant?.restaurantSubRole
    if (sub === 'KITCHEN') {
      return [
        { to: '/restaurant/kds', label: 'Kitchen line' },
        { to: '/restaurant/menu', label: 'Menu' },
        { to: '/restaurant/orders', label: 'Live queue' },
        { to: '/restaurant/orders-history', label: 'Order history' },
        { to: '/restaurant/sign-out', label: 'Sign out' },
      ]
    }
    if (sub === 'MANAGER') {
      return [
        { to: '/restaurant/dashboard', label: 'Store operations' },
        { to: '/restaurant/subscription', label: 'Subscription' },
        { to: '/restaurant/menu', label: 'Menu & availability' },
        { to: '/restaurant/qr-codes', label: 'Table QR codes' },
        { to: '/restaurant/orders-history', label: 'Order history' },
        { to: '/restaurant/orders', label: 'Live queue' },
        { to: '/restaurant/sign-out', label: 'Sign out' },
      ]
    }
    return [
      { to: '/restaurant/onboarding', label: 'Onboarding wizard' },
      { to: '/restaurant/dashboard', label: 'Dashboard' },
      { to: '/restaurant/subscription', label: 'Subscription' },
      { to: '/restaurant/live-map', label: 'Live tables' },
      { to: '/restaurant/media', label: 'Media review' },
      { to: '/restaurant/menu', label: 'Menu manager' },
      { to: '/restaurant/qr-codes', label: 'Table QR codes' },
      { to: '/restaurant/orders-history', label: 'Order history' },
      { to: '/restaurant/team', label: 'Staff management' },
      { to: '/restaurant/orders', label: 'Kitchen queue' },
      { to: '/restaurant/order/1024', label: 'Order detail (sample)' },
      { to: '/restaurant/sign-out', label: 'Sign out' },
    ]
  }, [authState.restaurant?.restaurantSubRole])

  const adminNavItems = useMemo((): NavLinkItem[] => {
    const core: NavLinkItem[] = [
      { to: '/admin/dashboard', label: 'SaaS overview' },
      { to: '/admin/restaurants', label: 'Approval queue' },
      { to: '/admin/billing', label: 'Billing & payments' },
      { to: '/admin/subscriptions', label: 'Subscriptions' },
      { to: '/admin/activity', label: 'Global activity' },
    ]
    if (authState.admin) {
      return [...core, { to: '/admin/sign-out', label: 'Sign out' }]
    }
    return [{ to: '/admin/login', label: 'Admin Login' }, ...core]
  }, [authState.admin])

  const restaurantPortalTitle =
    authState.restaurant?.restaurantSubRole === 'OWNER'
      ? 'Restaurant Owner'
      : authState.restaurant?.restaurantSubRole === 'MANAGER'
        ? 'Store Manager'
        : authState.restaurant?.restaurantSubRole === 'KITCHEN'
          ? 'Kitchen · KDS'
          : 'Restaurant'

  const restaurantMenuMode =
    authState.restaurant?.restaurantSubRole === 'KITCHEN' ? 'view' : 'manage'

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/customer/welcome" replace />} />

      <Route
        path="/customer/*"
        element={
          <CustomerGuestProvider>
            <PortalLayout
              portal="Customer"
              description={customerPortalDescription}
              isAuthenticated={Boolean(authState.customer)}
              navigationPresentation="drawer-always"
              showPortalSwitcher={!authState.customer}
              tenantLabel={authState.customer?.email}
              navItems={customerNavItems}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/customer/welcome" replace />} />
                <Route path="r/:restaurantId/t/:tableCode" element={<CustomerQrEntry />} />
                <Route
                  path="login"
                  element={<CustomerLogin onLogin={login} sessionUser={authState.customer} />}
                />
                <Route path="register" element={<CustomerRegister />} />
                <Route path="welcome" element={<CustomerWelcome />} />
                <Route path="menu" element={<CustomerMenu />} />
                <Route path="cart" element={<CustomerCart />} />
                <Route path="record-audio" element={<CustomerRecordAudio />} />
                <Route path="record-video" element={<CustomerRecordVideo />} />
                <Route path="tracking" element={<CustomerTracking />} />
                <Route path="sign-out" element={<CustomerSignOut onSignOut={clearCustomerAuth} />} />
              </Routes>
            </PortalLayout>
          </CustomerGuestProvider>
        }
      />

      <Route
        path="/restaurant/*"
        element={
          <PortalLayout
            portal={restaurantPortalTitle}
            description="Tenant-scoped dashboard • minimalist SaaS UI"
            isAuthenticated={Boolean(authState.restaurant)}
            layoutVariant="sidebar"
            tenantLabel={
              authState.restaurant?.tenantId != null
                ? `tenant_id: ${authState.restaurant.tenantId}`
                : undefined
            }
            navItems={
              authState.restaurant
                ? restaurantNav
                : [
                    { to: '/restaurant/login', label: 'Staff login' },
                    { to: '/restaurant/register', label: 'Restaurant signup' },
                  ]
            }
          >
            <Routes>
              <Route
                path="/"
                element={
                  <RestaurantIndexRedirect subRole={authState.restaurant?.restaurantSubRole} />
                }
              />
              <Route
                path="login"
                element={<RestaurantLogin onLogin={login} sessionUser={authState.restaurant} />}
              />
              <Route
                path="register"
                element={<RestaurantRegister onSubmitRegistration={submitRestaurantRegistration} />}
              />
              <Route
                path="onboarding"
                element={<OwnerOnboardingWizard tenantId={activeTenantId} />}
              />
              <Route
                path="dashboard"
                element={
                  <RestaurantRoleDashboard subRole={authState.restaurant?.restaurantSubRole} />
                }
              />
              <Route path="live-map" element={<OwnerLiveTablesMap tenantId={activeTenantId} />} />
              <Route path="media" element={<OwnerMediaReview tenantId={activeTenantId} />} />
              <Route
                path="team"
                element={<RestaurantTeamUsers users={restaurantUsers} onAddUser={addRestaurantUser} />}
              />
              <Route
                path="menu"
                element={
                  <RestaurantMenuManage
                    items={restaurantMenu}
                    mode={restaurantMenuMode}
                    onAddMenuItem={addMenuItem}
                    onUpdateItem={updateMenuItem}
                    onRemoveItem={removeMenuItem}
                  />
                }
              />
              <Route path="orders-history" element={<OrderHistoryPro tenantId={activeTenantId} />} />
              <Route path="subscription" element={<RestaurantSubscription tenantId={activeTenantId} />} />
              <Route path="qr-codes" element={<RestaurantQrCodes tenantId={activeTenantId} />} />
              <Route path="orders" element={<RestaurantOrders tenantId={activeTenantId} />} />
              <Route path="kds" element={<KitchenKDS tenantId={activeTenantId} />} />
              <Route path="sign-out" element={<RestaurantSignOut onSignOut={clearRestaurantAuth} />} />
              <Route path="order/:id" element={<RestaurantOrderDetails />} />
            </Routes>
          </PortalLayout>
        }
      />

      <Route
        path="/admin/*"
        element={
          <PortalLayout
            portal="Platform Admin"
            description="Rifat control panel"
            isAuthenticated={Boolean(authState.admin)}
            navItems={adminNavItems}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/admin/login" replace />} />
              <Route
                path="login"
                element={
                  <AdminLogin
                    platformOwner={platformOwner}
                    onLogin={login}
                    sessionUser={authState.admin}
                  />
                }
              />
              <Route
                path="dashboard"
                element={
                  <SaaSAdminDashboard
                    pendingCount={pendingCount}
                    activeTenants={restaurantMeta.approvedCount}
                  />
                }
              />
              <Route path="billing" element={<AdminBillingPayments tenants={restaurantRequests} />} />
              <Route
                path="restaurants"
                element={
                  <AdminRestaurants
                    pendingCount={pendingCount}
                    catalogTick={restaurantCatalogTick}
                    onApprove={approveRestaurantRequest}
                  />
                }
              />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="activity" element={<AdminActivity />} />
              <Route path="sign-out" element={<AdminSignOut onSignOut={clearAdminAuth} />} />
            </Routes>
          </PortalLayout>
        }
      />
    </Routes>
  )
}

export default App

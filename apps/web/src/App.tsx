import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import {
  AdminActivity,
  AdminLogin,
  AdminRestaurants,
  AdminSubscriptions,
  SaaSAdminDashboard,
  SaaSBillingMock,
} from './admin'
import {
  CustomerCart,
  CustomerGuestProvider,
  CustomerLogin,
  CustomerMenu,
  CustomerQrEntry,
  CustomerRecordAudio,
  CustomerRecordVideo,
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
  RestaurantTeamUsers,
} from './restaurant'

function App() {
  const location = useLocation()
  const [restaurantRequests, setRestaurantRequests] = useState<RestaurantRequest[]>([])
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
    const [ownerRes, requestsRes] = await Promise.all([
      fetch(`${API_BASE}/admin/default-owner`),
      fetch(`${API_BASE}/admin/restaurant-requests`),
    ])

    if (ownerRes.ok) {
      const ownerData = (await ownerRes.json()) as PlatformOwner
      setPlatformOwner(ownerData)
    }

    if (requestsRes.ok) {
      const requestData = (await requestsRes.json()) as RestaurantRequest[]
      setRestaurantRequests(requestData)
    }
  }

  async function refreshTenantData(tenantId: number) {
    const [menuRes, usersRes] = await Promise.all([
      fetch(`${API_BASE}/restaurant/${tenantId}/menu-items`),
      fetch(`${API_BASE}/restaurant/${tenantId}/users`),
    ])

    if (menuRes.ok) {
      const menuData = (await menuRes.json()) as Array<{
        name: string
        category: string
        price: number
      }>
      setRestaurantMenu(
        menuData.map((item) => ({
          name: item.name,
          description: `${item.category} • Available`,
          price: item.price,
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

  const pendingCount = useMemo(
    () => restaurantRequests.filter((request) => request.status === 'PENDING').length,
    [restaurantRequests],
  )

  async function submitRestaurantRegistration(payload: RestaurantSignupPayload) {
    await fetch(`${API_BASE}/restaurant/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await refreshAdminCatalog()
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
    await refreshTenantData(activeTenantId)
  }

  async function addMenuItem(item: MenuItem) {
    const category = item.description.split('•')[0]?.trim() || 'General'
    await fetch(`${API_BASE}/restaurant/${activeTenantId}/menu-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: item.name,
        category,
        price: item.price,
      }),
    })
    await refreshTenantData(activeTenantId)
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

  const restaurantNav = useMemo((): NavLinkItem[] => {
    const sub = authState.restaurant?.restaurantSubRole
    if (sub === 'KITCHEN') {
      return [{ to: '/restaurant/kds', label: 'Kitchen Display (KDS)' }]
    }
    if (sub === 'MANAGER') {
      return [
        { to: '/restaurant/dashboard', label: 'Store operations' },
        { to: '/restaurant/menu', label: 'Menu & availability' },
        { to: '/restaurant/qr-codes', label: 'Table QR links' },
        { to: '/restaurant/orders-history', label: 'Order history' },
        { to: '/restaurant/orders', label: 'Live queue' },
      ]
    }
    return [
      { to: '/restaurant/onboarding', label: 'Onboarding wizard' },
      { to: '/restaurant/dashboard', label: 'Dashboard' },
      { to: '/restaurant/live-map', label: 'Live tables' },
      { to: '/restaurant/media', label: 'Media review' },
      { to: '/restaurant/menu', label: 'Menu manager' },
      { to: '/restaurant/qr-codes', label: 'Table QR links' },
      { to: '/restaurant/orders-history', label: 'Order history' },
      { to: '/restaurant/team', label: 'Staff management' },
      { to: '/restaurant/orders', label: 'Kitchen queue' },
      { to: '/restaurant/order/1024', label: 'Order detail (sample)' },
    ]
  }, [authState.restaurant?.restaurantSubRole])

  const restaurantPortalTitle =
    authState.restaurant?.restaurantSubRole === 'OWNER'
      ? 'Restaurant Owner'
      : authState.restaurant?.restaurantSubRole === 'MANAGER'
        ? 'Store Manager'
        : authState.restaurant?.restaurantSubRole === 'KITCHEN'
          ? 'Kitchen · KDS'
          : 'Restaurant'

  const restaurantLayout: 'sidebar' | 'kitchen-top' =
    authState.restaurant?.restaurantSubRole === 'KITCHEN' ? 'kitchen-top' : 'sidebar'

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/customer/welcome" replace />} />

      <Route
        path="/customer/*"
        element={
          <CustomerGuestProvider>
            <PortalLayout
              portal="Customer"
              description="Scan QR · order without an account"
              isAuthenticated={Boolean(authState.customer)}
              navItems={[
                { to: '/customer/welcome', label: 'Welcome / QR' },
                { to: '/customer/menu', label: 'Menu' },
                { to: '/customer/cart', label: 'Cart & checkout' },
                { to: '/customer/tracking', label: 'Order status' },
                { to: '/customer/record-audio', label: 'Audio (optional)' },
                { to: '/customer/record-video', label: 'Video (optional)' },
                { to: '/customer/login', label: 'Login (optional)' },
              ]}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/customer/welcome" replace />} />
                <Route path="r/:restaurantId/t/:tableCode" element={<CustomerQrEntry />} />
                <Route
                  path="login"
                  element={<CustomerLogin onLogin={login} sessionUser={authState.customer} />}
                />
                <Route path="welcome" element={<CustomerWelcome />} />
                <Route path="menu" element={<CustomerMenu />} />
                <Route path="cart" element={<CustomerCart />} />
                <Route path="record-audio" element={<CustomerRecordAudio />} />
                <Route path="record-video" element={<CustomerRecordVideo />} />
                <Route path="tracking" element={<CustomerTracking />} />
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
            layoutVariant={restaurantLayout}
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
                    onAddMenuItem={addMenuItem}
                    canEditAll={authState.restaurant?.restaurantSubRole !== 'MANAGER'}
                  />
                }
              />
              <Route path="orders-history" element={<OrderHistoryPro tenantId={activeTenantId} />} />
              <Route path="qr-codes" element={<RestaurantQrCodes tenantId={activeTenantId} />} />
              <Route path="orders" element={<RestaurantOrders tenantId={activeTenantId} />} />
              <Route path="kds" element={<KitchenKDS tenantId={activeTenantId} />} />
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
            navItems={[
              { to: '/admin/login', label: 'Admin Login' },
              { to: '/admin/dashboard', label: 'SaaS overview' },
              { to: '/admin/restaurants', label: 'Approval queue' },
              { to: '/admin/billing', label: 'Billing (Stripe)' },
              { to: '/admin/subscriptions', label: 'Subscriptions' },
              { to: '/admin/activity', label: 'Global activity' },
            ]}
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
                    activeTenants={restaurantRequests.filter((r) => r.status === 'APPROVED').length}
                  />
                }
              />
              <Route path="billing" element={<SaaSBillingMock />} />
              <Route
                path="restaurants"
                element={
                  <AdminRestaurants
                    requests={restaurantRequests}
                    pendingCount={pendingCount}
                    onApprove={approveRestaurantRequest}
                  />
                }
              />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="activity" element={<AdminActivity />} />
            </Routes>
          </PortalLayout>
        }
      />
    </Routes>
  )
}

export default App

export type MenuItem = {
  id?: number
  name: string
  description: string
  price: number
  /** Set when loaded from API (edit/delete) */
  category?: string
  available?: boolean
  /** Photo slug → `/menu-food/{imageKey}.jpg` */
  imageKey?: string | null
}
export type OrderItem = { name: string; qty: number; note?: string; price: number }

/** Mirrors Prisma `SubscriptionEnforcement` */
export type SubscriptionEnforcement = 'TRIAL_TIME_AND_ORDERS' | 'PRO_UNLIMITED'

/** Row from `Subscription` table (admin catalog + API) */
export type SubscriptionCatalogEntry = {
  id: number
  slug: string
  name: string
  description: string | null
  active: boolean
  sortOrder: number
  enforcement: SubscriptionEnforcement
  trialDurationMonths: number
  guestOrderTrialCap: number
  paidWindowMonths: number
  renewalPeriodMonths: number | null
  guestOrderPaidBudget: number
  priceCents: number | null
}

/** Options returned on GET /restaurant/:id/subscription (active plans only). */
export type RestaurantSubscriptionCatalogItem = Pick<
  SubscriptionCatalogEntry,
  | 'id'
  | 'slug'
  | 'name'
  | 'description'
  | 'enforcement'
  | 'trialDurationMonths'
  | 'guestOrderTrialCap'
  | 'paidWindowMonths'
  | 'renewalPeriodMonths'
  | 'guestOrderPaidBudget'
  | 'priceCents'
  | 'sortOrder'
>

export type RestaurantRequest = {
  id: number
  ownerName: string
  ownerEmail: string
  ownerPassword: string
  restaurantName: string
  city: string
  initialUserName?: string
  initialUserEmail?: string
  initialUserPassword?: string
  initialUserRole?: 'MANAGER' | 'STAFF' | 'CASHIER'
  status: 'PENDING' | 'APPROVED'
  subscriptionId: number
  subscriptionSlug: string
  subscriptionName: string
  trialEndsAt: string
  trialOrdersRemaining: number
  proRenewsAt: string | null
}

/** GET /restaurant/:id/subscription */
export type RestaurantSubscriptionSnapshot = {
  restaurantId: number
  name: string
  city: string
  status: 'PENDING' | 'APPROVED'
  subscriptionId: number
  subscriptionSlug: string
  subscriptionName: string
  subscriptionDescription: string | null
  enforcement: SubscriptionEnforcement
  trialEndsAt: string
  trialOrdersRemaining: number
  proRenewsAt: string | null
  catalog: RestaurantSubscriptionCatalogItem[]
}

/** GET /admin/subscription-tenants */
export type AdminSubscriptionTenantRow = {
  id: number
  restaurantName: string
  city: string
  status: 'PENDING' | 'APPROVED'
  subscriptionId: number
  subscriptionSlug: string
  subscriptionName: string
  trialEndsAt: string
  trialOrdersRemaining: number
  proRenewsAt: string | null
}
/** POST /restaurant/register — subscription fields are assigned server-side. */
export type RestaurantSignupPayload = Omit<
  RestaurantRequest,
  | 'id'
  | 'status'
  | 'subscriptionId'
  | 'subscriptionSlug'
  | 'subscriptionName'
  | 'trialEndsAt'
  | 'trialOrdersRemaining'
  | 'proRenewsAt'
>
export type RestaurantTeamUser = {
  id: number
  restaurantId: number
  name: string
  email: string
  role: 'MANAGER' | 'STAFF' | 'CASHIER' | 'OWNER'
  approved: boolean
}
export type PlatformOwner = { email: string; name: string; passwordHint: string }
export type LoginRole = 'CUSTOMER' | 'RESTAURANT' | 'ADMIN'
/** Tenant RBAC: maps to Owner / Manager / Kitchen (KDS) UIs */
export type RestaurantSubRole = 'OWNER' | 'MANAGER' | 'KITCHEN'
export type AuthUser = {
  role: LoginRole
  email: string
  name: string
  tenantId?: number
  restaurantSubRole?: RestaurantSubRole
}
export type AuthResponse = { token: string; user: AuthUser }
export type NavLinkItem = { to: string; label: string }

/** Super-admin: which checkout rails exist for the platform / per tenant */
export type PaymentProviderId = 'stripe' | 'paypal' | 'card'
export type PaymentMethodFlags = Record<PaymentProviderId, boolean>

/** Cursor page from GET /admin/restaurant-requests */
export type RestaurantRequestsPage = {
  items: RestaurantRequest[]
  nextCursor: number | null
  pendingCount: number
  approvedCount: number
}

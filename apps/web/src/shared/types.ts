export type MenuItem = { name: string; description: string; price: number }
export type OrderItem = { name: string; qty: number; note?: string; price: number }
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
}
export type RestaurantSignupPayload = Omit<RestaurantRequest, 'id' | 'status'>
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

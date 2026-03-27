import type { MenuItem, OrderItem } from './types'

/** Product / platform name */
export const PRODUCT_NAME = 'KitchenFlow'

/** API origin only (no path). Fetches use `/api/v1/...` on this host. */
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')
export const API_BASE = `${API_ORIGIN}/api/v1`
export const DEMO_RESTAURANT_ID = 1001

export const demoMenuItems: MenuItem[] = [
  { name: 'Ribeye Steak', description: '12oz, steak fries, house sauce', price: 29 },
  { name: 'Mashed Potatoes', description: 'Creamy butter mashed side', price: 7 },
  { name: 'House Salad', description: 'Fresh greens + ranch', price: 6 },
  { name: 'Sweet Tea', description: 'Fresh brewed, lemon optional', price: 3 },
]

export const demoOrderItems: OrderItem[] = [
  { name: 'Ribeye Steak', qty: 1, note: 'Medium rare', price: 29 },
  { name: 'Mashed Potatoes', qty: 1, note: 'Extra gravy', price: 7 },
  { name: 'Sweet Tea', qty: 1, price: 3 },
]

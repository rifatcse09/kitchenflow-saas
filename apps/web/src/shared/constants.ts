import type { MenuItem, OrderItem } from './types'

/** Product / platform name */
export const PRODUCT_NAME = 'KitchenFlow'

/** Must match API `MENU_IMAGE_KEYS` + files in `public/menu-food/*.jpg`. */
export const MENU_FOOD_IMAGE_KEYS = [
  'burger',
  'popcorn',
  'hotdog',
  'chowmein',
  'drinks',
  'bbq',
  'sandwich',
  'sides',
  'salad',
  'dessert',
  'default',
] as const

export type MenuFoodImageKey = (typeof MENU_FOOD_IMAGE_KEYS)[number]

export function menuFoodImageSrc(imageKey: string | null | undefined): string {
  const k = (imageKey ?? '').trim().toLowerCase()
  const safe = MENU_FOOD_IMAGE_KEYS.includes(k as MenuFoodImageKey) ? k : 'default'
  return `/menu-food/${safe}.jpg`
}

/** API origin only (no path). Fetches use `/api/v1/...` on this host. */
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')
export const API_BASE = `${API_ORIGIN}/api/v1`
/** Default tenant when not logged in (seed resets serials so this stays `1`; override via Vite env if needed). */
export const DEMO_RESTAURANT_ID = Number(import.meta.env.VITE_DEMO_RESTAURANT_ID) || 1

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

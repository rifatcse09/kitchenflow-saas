/* eslint-disable react-refresh/only-export-components -- context + provider in one module */
import type { ReactNode } from 'react'
import { createContext, useCallback, useMemo, useState } from 'react'

const STORAGE_KEY = 'kitchenflow.guest'

export type GuestSession = {
  restaurantId: number
  tableCode: string
  restaurantName?: string
}

export type CartLine = {
  menuItemId: number
  name: string
  price: number
  qty: number
  note?: string
}

type Ctx = {
  session: GuestSession | null
  setSession: (s: GuestSession) => void
  cart: CartLine[]
  addToCart: (line: Omit<CartLine, 'qty'> & { qty?: number }) => void
  updateQty: (menuItemId: number, qty: number) => void
  removeLine: (menuItemId: number) => void
  clearCart: () => void
  clearGuest: () => void
}

function readStoredSession(): GuestSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GuestSession
    if (parsed?.restaurantId && parsed?.tableCode) return parsed
  } catch {
    /* ignore */
  }
  return null
}

export const CustomerGuestContext = createContext<Ctx | null>(null)

export function CustomerGuestProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<GuestSession | null>(readStoredSession)
  const [cart, setCart] = useState<CartLine[]>([])

  const setSession = useCallback((s: GuestSession) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    setSessionState(s)
  }, [])

  const clearGuest = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setSessionState(null)
    setCart([])
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const addToCart = useCallback((line: Omit<CartLine, 'qty'> & { qty?: number }) => {
    const qty = Math.max(1, line.qty ?? 1)
    setCart((prev) => {
      const i = prev.findIndex((p) => p.menuItemId === line.menuItemId)
      if (i === -1) {
        return [...prev, { menuItemId: line.menuItemId, name: line.name, price: line.price, qty, note: line.note }]
      }
      const next = [...prev]
      next[i] = {
        ...next[i],
        qty: next[i].qty + qty,
        note: line.note ?? next[i].note,
      }
      return next
    })
  }, [])

  const updateQty = useCallback((menuItemId: number, qty: number) => {
    if (qty < 1) {
      setCart((prev) => prev.filter((p) => p.menuItemId !== menuItemId))
      return
    }
    setCart((prev) => prev.map((p) => (p.menuItemId === menuItemId ? { ...p, qty } : p)))
  }, [])

  const removeLine = useCallback((menuItemId: number) => {
    setCart((prev) => prev.filter((p) => p.menuItemId !== menuItemId))
  }, [])

  const value = useMemo(
    () => ({
      session,
      setSession,
      cart,
      addToCart,
      updateQty,
      removeLine,
      clearCart,
      clearGuest,
    }),
    [session, setSession, cart, addToCart, updateQty, removeLine, clearCart, clearGuest],
  )

  return <CustomerGuestContext.Provider value={value}>{children}</CustomerGuestContext.Provider>
}

import { useContext } from 'react'
import { CustomerGuestContext } from './CustomerGuestContext'

export function useCustomerGuest() {
  const ctx = useContext(CustomerGuestContext)
  if (!ctx) {
    throw new Error('useCustomerGuest must be used under CustomerGuestProvider')
  }
  return ctx
}

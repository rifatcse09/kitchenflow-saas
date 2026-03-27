import { Navigate } from 'react-router-dom'
import type { RestaurantSubRole } from '../shared/types'

export function RestaurantIndexRedirect({ subRole }: { subRole?: RestaurantSubRole }) {
  if (!subRole) return <Navigate to="/restaurant/login" replace />
  if (subRole === 'KITCHEN') return <Navigate to="/restaurant/kds" replace />
  return <Navigate to="/restaurant/dashboard" replace />
}

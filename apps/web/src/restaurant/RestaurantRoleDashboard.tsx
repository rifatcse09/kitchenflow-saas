import type { RestaurantSubRole } from '../shared/types'
import { ManagerOperationsDashboard } from './ManagerOperationsDashboard'
import { OwnerTenantDashboard } from './OwnerTenantDashboard'

export function RestaurantRoleDashboard({ subRole }: { subRole?: RestaurantSubRole }) {
  if (subRole === 'MANAGER') return <ManagerOperationsDashboard />
  return <OwnerTenantDashboard />
}

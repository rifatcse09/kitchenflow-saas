import { API_BASE } from '../shared/constants'

export type QueueOrderRow = {
  id: number
  tableCode: string
  status: string
  total: number
  createdAt: string
  lines: Array<{ id?: number; name: string; qty: number; unitPrice: number }>
  customerPhone?: string | null
  customerEmail?: string | null
}

export function nextQueueOrderAction(status: string): { label: string; next: string } | null {
  const s = String(status).toUpperCase()
  if (s === 'PENDING') return { label: 'Start cooking', next: 'COOKING' }
  if (s === 'COOKING') return { label: 'Mark ready', next: 'READY' }
  if (s === 'READY') return { label: 'Complete order', next: 'COMPLETED' }
  return null
}

export async function patchRestaurantOrderStatus(
  tenantId: number,
  orderId: number,
  status: string,
): Promise<QueueOrderRow> {
  const res = await fetch(`${API_BASE}/restaurant/${tenantId}/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const j = await res.json().catch(() => null)
    const msg = (j as { message?: string } | null)?.message
    throw new Error(msg ?? `Update failed (${res.status})`)
  }
  return (await res.json()) as QueueOrderRow
}

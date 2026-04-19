import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import type { PaymentMethodFlags, PaymentProviderId, RestaurantRequest } from '../shared/types'

const STORAGE_KEY = 'kitchenflow.admin.paymentMethods.v1'

const PROVIDERS: { id: PaymentProviderId; label: string; blurb: string }[] = [
  { id: 'stripe', label: 'Stripe', blurb: 'Cards, wallets, subscriptions (Connect-ready).' },
  { id: 'paypal', label: 'PayPal', blurb: 'PayPal balance & buyer protection.' },
  { id: 'card', label: 'Card on file', blurb: 'Vaulted cards for repeat guests / tabs.' },
]

const PLATFORM_DEFAULT: PaymentMethodFlags = { stripe: true, paypal: false, card: true }

function tenantDefaults(p: PaymentMethodFlags): PaymentMethodFlags {
  return {
    stripe: p.stripe,
    paypal: p.paypal,
    card: p.card,
  }
}

function loadConfig(): {
  platform: PaymentMethodFlags
  tenants: Record<number, PaymentMethodFlags>
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { platform: { ...PLATFORM_DEFAULT }, tenants: {} }
    const j = JSON.parse(raw) as { platform?: PaymentMethodFlags; tenants?: Record<string, PaymentMethodFlags> }
    const platform = {
      stripe: Boolean(j.platform?.stripe),
      paypal: Boolean(j.platform?.paypal),
      card: Boolean(j.platform?.card),
    }
    const tenants: Record<number, PaymentMethodFlags> = {}
    if (j.tenants && typeof j.tenants === 'object') {
      for (const [k, v] of Object.entries(j.tenants)) {
        const id = Number(k)
        if (!Number.isFinite(id)) continue
        tenants[id] = {
          stripe: Boolean(v?.stripe),
          paypal: Boolean(v?.paypal),
          card: Boolean(v?.card),
        }
      }
    }
    for (const id of Object.keys(tenants)) {
      const row = tenants[Number(id)]
      if (!row) continue
      const tid = Number(id)
      tenants[tid] = {
        stripe: Boolean(row.stripe) && platform.stripe,
        paypal: Boolean(row.paypal) && platform.paypal,
        card: Boolean(row.card) && platform.card,
      }
    }
    return { platform, tenants }
  } catch {
    return { platform: { ...PLATFORM_DEFAULT }, tenants: {} }
  }
}

function saveConfig(platform: PaymentMethodFlags, tenants: Record<number, PaymentMethodFlags>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ platform, tenants }))
  } catch {
    /* ignore */
  }
}

export function AdminBillingPayments({ tenants }: { tenants: RestaurantRequest[] }) {
  const approved = useMemo(() => tenants.filter((t) => t.status === 'APPROVED'), [tenants])
  const [{ platform, tenants: byTenant }, setBundle] = useState(loadConfig)

  useEffect(() => {
    saveConfig(platform, byTenant)
  }, [platform, byTenant])

  const ensureTenantRows = useCallback(() => {
    setBundle((prev) => {
      const nextT = { ...prev.tenants }
      let changed = false
      for (const t of approved) {
        if (nextT[t.id] == null) {
          nextT[t.id] = tenantDefaults(prev.platform)
          changed = true
        }
      }
      return changed ? { ...prev, tenants: nextT } : prev
    })
  }, [approved])

  useEffect(() => {
    ensureTenantRows()
  }, [ensureTenantRows])

  const setPlatformFlag = (id: PaymentProviderId, value: boolean) => {
    setBundle((prev) => {
      const platformNext = { ...prev.platform, [id]: value }
      const tenantsNext = { ...prev.tenants }
      for (const t of approved) {
        const cur = tenantsNext[t.id] ?? tenantDefaults(platformNext)
        tenantsNext[t.id] = { ...cur, [id]: value ? cur[id] : false }
      }
      return { platform: platformNext, tenants: tenantsNext }
    })
  }

  const setTenantFlag = (tenantId: number, id: PaymentProviderId, value: boolean) => {
    if (!platform[id] && value) return
    setBundle((prev) => {
      const cur = prev.tenants[tenantId] ?? tenantDefaults(prev.platform)
      return {
        ...prev,
        tenants: { ...prev.tenants, [tenantId]: { ...cur, [id]: value } },
      }
    })
  }

  return (
    <ScreenFrame
      title="Billing & payment methods"
      subtitle="Turn on platform integrations, then choose which rails each approved tenant may offer at checkout (saved in this browser for demo)."
      frameClassName="admin-portal-screen"
    >
      <h3 className="section-title">Platform integrations</h3>
      <p className="admin-pay-lead">
        When a method is off here, it stays unavailable for every tenant until you configure and enable it again.
      </p>
      <div className="admin-pay-platform-grid">
        {PROVIDERS.map((p) => (
          <label key={p.id} className="admin-pay-platform-card">
            <div className="admin-pay-platform-card-text">
              <strong>{p.label}</strong>
              <span>{p.blurb}</span>
            </div>
            <input
              type="checkbox"
              className="admin-pay-checkbox"
              checked={platform[p.id]}
              onChange={(e) => setPlatformFlag(p.id, e.target.checked)}
            />
          </label>
        ))}
      </div>

      <h3 className="section-title">Tenant checkout</h3>
      <p className="admin-pay-lead">Approved restaurants only. Disabled cells mean the platform integration is off.</p>

      {approved.length === 0 ? (
        <p className="hint">No approved tenants yet. Approve a restaurant from the approval queue first.</p>
      ) : (
        <div className="admin-pay-table-wrap">
          <table className="admin-pay-table">
            <thead>
              <tr>
                <th scope="col">Tenant</th>
                <th scope="col">Stripe</th>
                <th scope="col">PayPal</th>
                <th scope="col">Card on file</th>
              </tr>
            </thead>
            <tbody>
              {approved.map((t) => {
                const row = byTenant[t.id] ?? tenantDefaults(platform)
                return (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.restaurantName}</strong>
                      <div className="admin-pay-tenant-meta">#{t.id} · {t.city}</div>
                    </td>
                    {(['stripe', 'paypal', 'card'] as const).map((pid) => (
                      <td key={pid}>
                        <input
                          type="checkbox"
                          className="admin-pay-checkbox"
                          checked={Boolean(row[pid]) && platform[pid]}
                          disabled={!platform[pid]}
                          onChange={(e) => setTenantFlag(t.id, pid, e.target.checked)}
                          aria-label={`${t.restaurantName}, ${pid}`}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="section-title">Subscription snapshot (mock)</h3>
      <article className="list-item">
        <div>
          <h4>Smokey House BBQ</h4>
          <p>Pro • $99/mo • Next renew Apr 12</p>
        </div>
        <strong>Paid</strong>
      </article>
      <article className="list-item">
        <div>
          <h4>Taco Rush Truck</h4>
          <p>Trial • 5 days left</p>
        </div>
        <strong>$0</strong>
      </article>
      <button className="primary-btn" type="button">
        Open billing provider dashboard
      </button>
    </ScreenFrame>
  )
}

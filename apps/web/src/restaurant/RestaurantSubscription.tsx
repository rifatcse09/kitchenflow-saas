import { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import type { RestaurantSubscriptionSnapshot } from '../shared/types'

function formatWhen(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function enforcementLabel(e: RestaurantSubscriptionSnapshot['enforcement']) {
  return e === 'TRIAL_TIME_AND_ORDERS' ? 'Trial (time + guest orders)' : 'Paid (unlimited guest orders)'
}

export function RestaurantSubscription({ tenantId }: { tenantId: number }) {
  const [data, setData] = useState<RestaurantSubscriptionSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/restaurant/${tenantId}/subscription`)
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        const msg = (j as { message?: string } | null)?.message
        throw new Error(msg ?? `Could not load subscription (${res.status})`)
      }
      setData((await res.json()) as RestaurantSubscriptionSnapshot)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    void load()
  }, [load])

  async function selectPlan(subscriptionId: number) {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/restaurant/${tenantId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        const msg = (j as { message?: string } | null)?.message
        throw new Error(msg ?? `Update failed (${res.status})`)
      }
      setData((await res.json()) as RestaurantSubscriptionSnapshot)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScreenFrame
      title="Subscription & trial"
      subtitle="Pick an active plan from the platform catalog. New restaurants start on the free trial."
      frameClassName="restaurant-portal-screen"
      headerAction={
        <button type="button" className="ghost-btn" disabled={loading || saving} onClick={() => void load()}>
          Refresh
        </button>
      }
    >
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="subscription-page-loading">Loading…</p> : null}

      {!loading && data ? (
        <>
          <article className="subscription-tenant-card">
            <div className="subscription-catalog-card__title-row">
              <h4>{data.name}</h4>
              <span className={`status-pill${data.status === 'APPROVED' ? ' ready' : ' pending'}`}>
                {data.status === 'APPROVED' ? 'Approved' : 'Pending'}
              </span>
            </div>
            <p className="subscription-tenant-lead">{data.city}</p>
            <p className="subscription-tenant-plan">
              <strong>Current plan</strong> {data.subscriptionName}{' '}
              <code className="subscription-catalog-code">{data.subscriptionSlug}</code>
            </p>
            {data.subscriptionDescription ? (
              <p className="subscription-catalog-desc">{data.subscriptionDescription}</p>
            ) : null}
            <p className="subscription-catalog-lead">{enforcementLabel(data.enforcement)}</p>
            <ul className="subscription-catalog-meta subscription-catalog-meta--tenant" aria-label="Usage">
              <li>
                <strong>Trial / window ends</strong>
                <span>{formatWhen(data.trialEndsAt)}</span>
              </li>
              <li>
                <strong>Guest orders left</strong>
                <span>{data.trialOrdersRemaining}</span>
              </li>
              <li>
                <strong>Renewal</strong>
                <span>{data.proRenewsAt ? formatWhen(data.proRenewsAt) : '—'}</span>
              </li>
            </ul>
          </article>

          <h3 className="section-title">Change plan</h3>
          {(data.catalog ?? []).map((opt) => {
            const active = data.subscriptionId === opt.id
            return (
              <article className="subscription-catalog-card" key={opt.id}>
                <div className="subscription-catalog-card__title-row">
                  <h4>{opt.name}</h4>
                  {active ? <span className="status-pill ready">Current</span> : null}
                </div>
                {opt.description ? <p className="subscription-catalog-desc">{opt.description}</p> : null}
                <p className="subscription-catalog-lead">
                  {enforcementLabel(opt.enforcement)}
                  <span className="subscription-catalog-sep">·</span>
                  <code className="subscription-catalog-code">{opt.slug}</code>
                </p>
                <div className="subscription-catalog-card__actions">
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={saving || active}
                    onClick={() => void selectPlan(opt.id)}
                  >
                    {active ? 'Current plan' : 'Select'}
                  </button>
                </div>
              </article>
            )
          })}
        </>
      ) : null}
    </ScreenFrame>
  )
}

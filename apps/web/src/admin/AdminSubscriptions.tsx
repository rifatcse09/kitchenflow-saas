import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import type {
  AdminSubscriptionTenantRow,
  SubscriptionCatalogEntry,
  SubscriptionEnforcement,
} from '../shared/types'

function formatWhen(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return iso
  }
}

function enforcementLabel(e: SubscriptionEnforcement) {
  return e === 'TRIAL_TIME_AND_ORDERS' ? 'Trial' : 'Pro (paid)'
}

type CatalogForm = {
  slug: string
  name: string
  description: string
  active: boolean
  sortOrder: string
  enforcement: SubscriptionEnforcement
  trialDurationMonths: string
  guestOrderTrialCap: string
  paidWindowMonths: string
  renewalPeriodMonths: string
  guestOrderPaidBudget: string
  priceCents: string
}

function emptyForm(): CatalogForm {
  return {
    slug: '',
    name: '',
    description: '',
    active: true,
    sortOrder: '10',
    enforcement: 'TRIAL_TIME_AND_ORDERS',
    trialDurationMonths: '2',
    guestOrderTrialCap: '10',
    paidWindowMonths: '120',
    renewalPeriodMonths: '',
    guestOrderPaidBudget: '999999',
    priceCents: '',
  }
}

function formFromEntry(e: SubscriptionCatalogEntry): CatalogForm {
  return {
    slug: e.slug,
    name: e.name,
    description: e.description ?? '',
    active: e.active,
    sortOrder: String(e.sortOrder),
    enforcement: e.enforcement,
    trialDurationMonths: String(e.trialDurationMonths),
    guestOrderTrialCap: String(e.guestOrderTrialCap),
    paidWindowMonths: String(e.paidWindowMonths),
    renewalPeriodMonths: e.renewalPeriodMonths != null ? String(e.renewalPeriodMonths) : '',
    guestOrderPaidBudget: String(e.guestOrderPaidBudget),
    priceCents: e.priceCents != null ? String(e.priceCents) : '',
  }
}

function parseIntField(raw: string, label: string): number {
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n)) throw new Error(`${label} must be a number`)
  return n
}

export function AdminSubscriptions() {
  const [catalog, setCatalog] = useState<SubscriptionCatalogEntry[]>([])
  const [tenants, setTenants] = useState<AdminSubscriptionTenantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<CatalogForm>(emptyForm)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const [cRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/admin/subscriptions`),
        fetch(`${API_BASE}/admin/subscription-tenants`),
      ])
      if (!cRes.ok) throw new Error(`Could not load subscription catalog (${cRes.status})`)
      if (!tRes.ok) throw new Error(`Could not load tenants (${tRes.status})`)
      setCatalog((await cRes.json()) as SubscriptionCatalogEntry[])
      setTenants((await tRes.json()) as AdminSubscriptionTenantRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startCreate() {
    setEditorMode('create')
    setEditId(null)
    setForm(emptyForm())
  }

  function startEdit(row: SubscriptionCatalogEntry) {
    setEditorMode('edit')
    setEditId(row.id)
    setForm(formFromEntry(row))
  }

  function cancelEditor() {
    setEditorMode(null)
    setEditId(null)
    setForm(emptyForm())
  }

  async function submitCatalog(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const enforcement = form.enforcement
      const renewalRaw = form.renewalPeriodMonths.trim()
      const renewalPeriodMonths =
        enforcement === 'PRO_UNLIMITED'
          ? parseIntField(renewalRaw || '0', 'Renewal period (months)')
          : null
      if (enforcement === 'PRO_UNLIMITED' && (!Number.isFinite(renewalPeriodMonths) || renewalPeriodMonths! <= 0)) {
        throw new Error('Paid plans need renewal period months > 0')
      }

      const body = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        active: form.active,
        sortOrder: parseIntField(form.sortOrder, 'Sort order'),
        enforcement,
        trialDurationMonths: parseIntField(form.trialDurationMonths, 'Trial duration months'),
        guestOrderTrialCap: parseIntField(form.guestOrderTrialCap, 'Guest order trial cap'),
        paidWindowMonths: parseIntField(form.paidWindowMonths, 'Paid window months'),
        renewalPeriodMonths,
        guestOrderPaidBudget: parseIntField(form.guestOrderPaidBudget, 'Guest order paid budget'),
        priceCents: form.priceCents.trim() === '' ? null : parseIntField(form.priceCents, 'Price (cents)'),
      }

      if (editorMode === 'create') {
        const res = await fetch(`${API_BASE}/admin/subscriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error((j as { message?: string } | null)?.message ?? `Create failed (${res.status})`)
        }
      } else if (editorMode === 'edit' && editId != null) {
        const res = await fetch(`${API_BASE}/admin/subscriptions/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error((j as { message?: string } | null)?.message ?? `Update failed (${res.status})`)
        }
      }
      cancelEditor()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScreenFrame
      title="Subscriptions & licensing"
      subtitle="Define subscription products, then see which tenant is on which plan."
      frameClassName="admin-portal-screen"
      headerAction={
        <div className="screen-header-action-group">
          <button type="button" className="ghost-btn" disabled={loading} onClick={() => void load()}>
            Refresh
          </button>
          <button type="button" className="primary-btn" disabled={loading || saving} onClick={startCreate}>
            New subscription
          </button>
        </div>
      }
    >
      {error ? <p className="error-text">{error}</p> : null}

      <h3 className="section-title">Subscription catalog</h3>
      {loading ? <p className="hint">Loading…</p> : null}

      {!loading &&
        catalog.map((row) => (
          <article className="subscription-catalog-card" key={row.id}>
            <div className="subscription-catalog-card__title-row">
              <h4>{row.name}</h4>
              <span className={`status-pill${row.active ? ' ready' : ' pending'}`}>
                {row.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="subscription-catalog-lead">
              <code className="subscription-catalog-code">{row.slug}</code>
              <span className="subscription-catalog-sep">·</span>
              {enforcementLabel(row.enforcement)}
              <span className="subscription-catalog-sep">·</span>
              sort {row.sortOrder}
            </p>
            {row.description ? <p className="subscription-catalog-desc">{row.description}</p> : null}
            <ul className="subscription-catalog-meta" aria-label="Plan limits">
              <li>
                <strong>Trial months</strong>
                <span>{row.trialDurationMonths}</span>
              </li>
              <li>
                <strong>Trial guest orders</strong>
                <span>{row.guestOrderTrialCap}</span>
              </li>
              <li>
                <strong>Paid window (mo)</strong>
                <span>{row.paidWindowMonths}</span>
              </li>
              <li>
                <strong>Renewal (mo)</strong>
                <span>{row.renewalPeriodMonths ?? '—'}</span>
              </li>
              <li>
                <strong>Paid budget</strong>
                <span>{row.guestOrderPaidBudget}</span>
              </li>
              <li>
                <strong>Price</strong>
                <span>{row.priceCents != null ? `${row.priceCents}¢` : '—'}</span>
              </li>
            </ul>
            <div className="subscription-catalog-card__actions">
              <button type="button" className="ghost-btn" onClick={() => startEdit(row)}>
                Edit
              </button>
            </div>
          </article>
        ))}

      {editorMode ? (
        <form className="admin-subscription-editor" onSubmit={(e) => void submitCatalog(e)}>
          <h3 className="section-title">{editorMode === 'create' ? 'Create subscription' : `Edit #${editId}`}</h3>
          <label className="field-label">
            Slug (lowercase, hyphens)
            <input
              className="field"
              value={form.slug}
              disabled={editorMode === 'edit'}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </label>
          <label className="field-label">
            Display name
            <input
              className="field"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label className="field-label">
            Description
            <textarea
              className="field"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label className="field-label">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />{' '}
            Active (inactive plans are hidden from restaurant pickers)
          </label>
          <label className="field-label">
            Sort order
            <input
              className="field"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
            />
          </label>
          <label className="field-label">
            Enforcement
            <select
              className="field"
              value={form.enforcement}
              onChange={(e) =>
                setForm((f) => ({ ...f, enforcement: e.target.value as SubscriptionEnforcement }))
              }
            >
              <option value="TRIAL_TIME_AND_ORDERS">Trial — time window + guest order cap</option>
              <option value="PRO_UNLIMITED">Paid — unlimited guest orders (demo budget)</option>
            </select>
          </label>
          <label className="field-label">
            Trial duration (months)
            <input
              className="field"
              type="number"
              value={form.trialDurationMonths}
              onChange={(e) => setForm((f) => ({ ...f, trialDurationMonths: e.target.value }))}
            />
          </label>
          <label className="field-label">
            Guest orders on trial tier
            <input
              className="field"
              type="number"
              value={form.guestOrderTrialCap}
              onChange={(e) => setForm((f) => ({ ...f, guestOrderTrialCap: e.target.value }))}
            />
          </label>
          <label className="field-label">
            Paid window (months, sets visibility end on paid assign)
            <input
              className="field"
              type="number"
              value={form.paidWindowMonths}
              onChange={(e) => setForm((f) => ({ ...f, paidWindowMonths: e.target.value }))}
            />
          </label>
          <label className="field-label">
            Renewal period (months, required for paid tier)
            <input
              className="field"
              type="number"
              value={form.renewalPeriodMonths}
              onChange={(e) => setForm((f) => ({ ...f, renewalPeriodMonths: e.target.value }))}
              placeholder="e.g. 1 or 12"
            />
          </label>
          <label className="field-label">
            Guest order budget when paid tier assigned
            <input
              className="field"
              type="number"
              value={form.guestOrderPaidBudget}
              onChange={(e) => setForm((f) => ({ ...f, guestOrderPaidBudget: e.target.value }))}
            />
          </label>
          <label className="field-label">
            Price (cents, optional)
            <input
              className="field"
              type="number"
              value={form.priceCents}
              onChange={(e) => setForm((f) => ({ ...f, priceCents: e.target.value }))}
            />
          </label>
          <div className="field-actions-row">
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="ghost-btn" disabled={saving} onClick={cancelEditor}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <h3 className="section-title">Tenants</h3>
      {!loading && tenants.length === 0 ? <p className="center-text">No restaurants found.</p> : null}

      {!loading &&
        tenants.map((r) => (
          <article className="subscription-tenant-card" key={r.id}>
            <div className="subscription-catalog-card__title-row">
              <h4>{r.restaurantName}</h4>
              <span className={`status-pill${r.status === 'APPROVED' ? ' ready' : ' pending'}`}>{r.status}</span>
            </div>
            <p className="subscription-tenant-lead">
              {r.city} · tenant id {r.id}
            </p>
            <p className="subscription-tenant-plan">
              <strong>Plan</strong> {r.subscriptionName}{' '}
              <code className="subscription-catalog-code">{r.subscriptionSlug}</code>
            </p>
            <ul className="subscription-catalog-meta subscription-catalog-meta--tenant" aria-label="Tenant usage">
              <li>
                <strong>Trial ends</strong>
                <span>{formatWhen(r.trialEndsAt)}</span>
              </li>
              <li>
                <strong>Guest orders left</strong>
                <span>{r.trialOrdersRemaining}</span>
              </li>
              <li>
                <strong>Renewal</strong>
                <span>{r.proRenewsAt ? formatWhen(r.proRenewsAt) : '—'}</span>
              </li>
            </ul>
          </article>
        ))}
    </ScreenFrame>
  )
}

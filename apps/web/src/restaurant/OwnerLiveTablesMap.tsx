import { ScreenFrame } from '../shared/components/ScreenFrame'

export function OwnerLiveTablesMap({ tenantId }: { tenantId: number }) {
  const tables = [
    { code: 'T12', state: 'ordering' as const },
    { code: 'T08', state: 'waiting' as const },
    { code: 'T04', state: 'ready' as const },
    { code: 'T02', state: 'idle' as const },
  ]
  return (
    <ScreenFrame title="Live table map" subtitle={`tenant_id ${tenantId} • grid mock`}>
      <div className="table-grid">
        {tables.map((t) => (
          <div key={t.code} className={`table-tile ${t.state}`}>
            <strong>{t.code}</strong>
            <span>{t.state}</span>
          </div>
        ))}
      </div>
    </ScreenFrame>
  )
}

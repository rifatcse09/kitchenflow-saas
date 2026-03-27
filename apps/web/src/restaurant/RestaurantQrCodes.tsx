import { ScreenFrame } from '../shared/components/ScreenFrame'

/**
 * Printable / shareable guest URLs. Production would use short links + branded domain.
 */
export function RestaurantQrCodes({ tenantId }: { tenantId: number }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.com'
  const examples = ['T01', 'T08', 'T12', 'BAR1']

  return (
    <ScreenFrame
      title="Table QR links"
      subtitle={`tenant_id ${tenantId} · point each QR to a URL below`}
    >
      <p className="hint">
        Guests scan first — no login. Each link encodes your restaurant id and a table code. Generate QR images in
        your design tool or a QR API using these URLs.
      </p>
      <ul className="hint" style={{ lineHeight: 1.8 }}>
        {examples.map((table) => {
          const url = `${origin}/customer/r/${tenantId}/t/${encodeURIComponent(table)}`
          return (
            <li key={table}>
              <strong>{table}</strong> — <code style={{ fontSize: 12 }}>{url}</code>
            </li>
          )
        })}
      </ul>
      <p className="hint">
        Flow: scan → menu loads for this tenant → cart → optional phone/email → submit to kitchen queue.
      </p>
    </ScreenFrame>
  )
}

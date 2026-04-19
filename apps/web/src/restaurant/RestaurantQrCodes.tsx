import { useCallback, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { ScreenFrame } from '../shared/components/ScreenFrame'

function QrUrlRow({ table, tenantId, origin }: { table: string; tenantId: number; origin: string }) {
  const url = `${origin}/customer/r/${tenantId}/t/${encodeURIComponent(table)}`
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'err'>('idle')

  useEffect(() => {
    let cancelled = false
    setQrDataUrl(null)
    setQrError(false)
    void QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl)
      })
      .catch(() => {
        if (!cancelled) setQrError(true)
      })
    return () => {
      cancelled = true
    }
  }, [url])

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopyStatus('copied')
      window.setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      setCopyStatus('err')
      window.setTimeout(() => setCopyStatus('idle'), 2500)
    }
  }, [url])

  const fileName = `kitchenflow-store-${tenantId}-table-${table}.png`

  return (
    <li className="qr-link-row">
      <div className="qr-link-qr" aria-hidden={qrError}>
        {qrError ? (
          <div className="qr-link-qr-fallback">Could not build QR</div>
        ) : qrDataUrl ? (
          <img src={qrDataUrl} alt={`QR code for table ${table}`} width={200} height={200} />
        ) : (
          <div className="qr-link-qr-skel" aria-busy="true">
            Generating…
          </div>
        )}
      </div>
      <div className="qr-link-main">
        <div className="qr-link-code" title="Table or zone code">
          {table}
        </div>
        <code className="qr-link-url">{url}</code>
        <div className="qr-link-actions">
          <button type="button" className="qr-link-copy" onClick={() => void copyUrl()}>
            {copyStatus === 'copied' ? 'Copied' : copyStatus === 'err' ? 'Retry copy' : 'Copy URL'}
          </button>
          {qrDataUrl ? (
            <a className="qr-link-download" href={qrDataUrl} download={fileName}>
              Download PNG
            </a>
          ) : (
            <span className="qr-link-download qr-link-download--disabled">Download PNG</span>
          )}
        </div>
      </div>
    </li>
  )
}

/**
 * Printable QR codes + guest URLs. PNGs are generated in the browser for each table.
 */
export function RestaurantQrCodes({ tenantId }: { tenantId: number }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.com'
  const examples = ['T01', 'T08', 'T12', 'BAR1']

  return (
    <ScreenFrame
      title="Table QR codes"
      subtitle={`Store #${tenantId} · print or save each QR. Scanning opens the guest menu for that table.`}
      frameClassName="restaurant-portal-screen"
    >
      <div className="qr-links-stack">
        <section className="qr-links-panel" aria-labelledby="qr-links-how">
          <h3 id="qr-links-how" className="qr-links-heading">
            What to print
          </h3>
          <p className="qr-links-lead">
            Each row includes a <strong>ready-made QR</strong> and the same link as text. Tape the QR to the table (or
            save the PNG and drop it into your menu design). Guests scan, then order for{' '}
            <strong>that table only</strong>. No guest login is required.
          </p>
        </section>

        <section className="qr-links-panel qr-links-panel--table" aria-label="Table QR codes and URLs">
          <ul className="qr-link-list">
            {examples.map((table) => (
              <QrUrlRow key={table} table={table} tenantId={tenantId} origin={origin} />
            ))}
          </ul>
        </section>

        <section className="qr-links-panel qr-links-panel--muted" aria-labelledby="qr-links-flow">
          <h3 id="qr-links-flow" className="qr-links-heading">
            Guest flow
          </h3>
          <ol className="qr-links-steps">
            <li>Scan QR</li>
            <li>Menu opens for this store and table</li>
            <li>Add to cart, optional phone or email</li>
            <li>Submit to the kitchen queue</li>
          </ol>
        </section>
      </div>
    </ScreenFrame>
  )
}

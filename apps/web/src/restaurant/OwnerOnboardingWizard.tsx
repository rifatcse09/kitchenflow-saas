import { useState } from 'react'
import { ScreenFrame } from '../shared/components/ScreenFrame'

export function OwnerOnboardingWizard({ tenantId }: { tenantId: number }) {
  const [step, setStep] = useState(1)
  return (
    <ScreenFrame
      title="Onboarding wizard"
      subtitle={`3 steps • tenant_id ${tenantId} (PostgreSQL-ready)`}
    >
      <div className="wizard-steps">
        <button
          type="button"
          className={step === 1 ? 'wizard-dot active' : 'wizard-dot'}
          onClick={() => setStep(1)}
        >
          1. Restaurant info
        </button>
        <button
          type="button"
          className={step === 2 ? 'wizard-dot active' : 'wizard-dot'}
          onClick={() => setStep(2)}
        >
          2. Create menu
        </button>
        <button
          type="button"
          className={step === 3 ? 'wizard-dot active' : 'wizard-dot'}
          onClick={() => setStep(3)}
        >
          3. QR codes
        </button>
      </div>
      {step === 1 ? (
        <p className="hint">Brand, tax, hours — maps to `restaurants` tenant row.</p>
      ) : null}
      {step === 2 ? <p className="hint">Menu CSV import or Menu manager when live.</p> : null}
      {step === 3 ? (
        <p className="hint">
          {'Generate https://app/r/{slug}/t/{table} QR URLs for print (mock).'}
        </p>
      ) : null}
      <button
        className="ghost-btn"
        type="button"
        onClick={() => setStep((s) => Math.min(3, s + 1))}
      >
        Next step
      </button>
    </ScreenFrame>
  )
}

import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerRecordAudio() {
  return (
    <ScreenFrame title="Record Your Order" subtitle="Optional confirmation">
      <div className="record-circle">🎙</div>
      <p className="center-text">Tap to record your order voice note.</p>
      <div className="hint">Example: Ribeye medium rare with mashed potatoes.</div>
      <button className="primary-btn">Save Audio & Continue</button>
      <button className="ghost-btn">Skip</button>
    </ScreenFrame>
  )
}

import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerRecordVideo() {
  return (
    <ScreenFrame title="Confirm with Video" subtitle="Optional dispute-proof recording">
      <div className="video-box">Camera preview</div>
      <p className="center-text">Please confirm your order summary in a short video.</p>
      <button className="primary-btn">Start Recording</button>
      <button className="ghost-btn">Skip</button>
    </ScreenFrame>
  )
}

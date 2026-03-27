import { ScreenFrame } from '../shared/components/ScreenFrame'

export function OwnerMediaReview({ tenantId }: { tenantId: number }) {
  return (
    <ScreenFrame title="Media review" subtitle={`High-value orders • tenant ${tenantId}`}>
      <article className="list-item">
        <div>
          <h4>Order #1024</h4>
          <p>$89 • audio 0:42</p>
        </div>
        <button className="ghost-btn" type="button">
          Play
        </button>
      </article>
      <article className="list-item">
        <div>
          <h4>Order #1018</h4>
          <p>$120 • video clip</p>
        </div>
        <button className="ghost-btn" type="button">
          Play
        </button>
      </article>
    </ScreenFrame>
  )
}

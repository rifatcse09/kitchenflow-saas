import { ScreenFrame } from '../shared/components/ScreenFrame'
import type { RestaurantRequest } from '../shared/types'

export function AdminRestaurants({
  requests,
  pendingCount,
  onApprove,
}: {
  requests: RestaurantRequest[]
  pendingCount: number
  onApprove: (id: number) => Promise<void>
}) {
  const pendingRequests = requests.filter((request) => request.status === 'PENDING')
  const approvedRequests = requests.filter((request) => request.status === 'APPROVED')

  return (
    <ScreenFrame
      title="Restaurant Approvals"
      subtitle={`${pendingCount} pending request(s) waiting for admin approval`}
    >
      {pendingRequests.length === 0 ? (
        <p className="center-text">No pending requests right now.</p>
      ) : null}

      {pendingRequests.map((request) => (
        <article className="queue-card" key={request.id}>
          <div>
            <h4>{request.restaurantName}</h4>
            <p>
              {request.city} • {request.ownerName} • {request.ownerEmail}
            </p>
            {request.initialUserEmail ? (
              <p>
                Initial Team User: {request.initialUserEmail} ({request.initialUserRole})
              </p>
            ) : null}
          </div>
          <div className="action-col">
            <span className="status-pill pending">Pending</span>
            <button className="approve-btn" onClick={() => void onApprove(request.id)}>
              Approve
            </button>
          </div>
        </article>
      ))}

      {approvedRequests.length > 0 ? (
        <>
          <h3 className="section-title">Approved</h3>
          {approvedRequests.map((request) => (
            <article className="queue-card" key={request.id}>
              <div>
                <h4>{request.restaurantName}</h4>
                <p>
                  {request.city} • {request.ownerName}
                </p>
              </div>
              <span className="status-pill ready">Approved</span>
            </article>
          ))}
        </>
      ) : null}
    </ScreenFrame>
  )
}

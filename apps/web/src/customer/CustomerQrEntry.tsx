import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE } from '../shared/constants'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import { useCustomerGuest } from './useCustomerGuest'

/** QR deep link: /customer/r/:restaurantId/t/:tableCode */
export function CustomerQrEntry() {
  const { restaurantId: rParam, tableCode: tParam } = useParams()
  const navigate = useNavigate()
  const { setSession } = useCustomerGuest()
  const [error, setError] = useState('')

  useEffect(() => {
    const restaurantId = Number(rParam)
    const tableCode = tParam ? decodeURIComponent(tParam) : ''
    if (!Number.isFinite(restaurantId) || restaurantId < 1 || !tableCode.trim()) {
      setError('Invalid QR link.')
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/restaurant/${restaurantId}/profile`)
        if (!res.ok) {
          throw new Error('Restaurant not found or not active')
        }
        const data = (await res.json()) as { id: number; name: string; city: string }
        if (cancelled) return
        setSession({
          restaurantId: data.id,
          tableCode: tableCode.trim(),
          restaurantName: data.name,
        })
        navigate('/customer/menu', { replace: true })
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load restaurant')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [rParam, tParam, navigate, setSession])

  if (error) {
    return (
      <ScreenFrame title="QR link" subtitle="Could not start your session" frameClassName="customer-vibe-screen">
        <p className="error-text">{error}</p>
        <button type="button" className="primary-btn" onClick={() => navigate('/customer/welcome')}>
          Back to welcome
        </button>
      </ScreenFrame>
    )
  }

  return (
    <ScreenFrame title="Opening menu…" subtitle="Loading restaurant from QR" frameClassName="customer-vibe-screen">
      <p className="hint">One moment.</p>
    </ScreenFrame>
  )
}

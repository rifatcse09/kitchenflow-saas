import { useLayoutEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ScreenFrame } from '../shared/components/ScreenFrame'

export function CustomerSignOut({ onSignOut }: { onSignOut: () => void }) {
  const navigate = useNavigate()
  const onSignOutRef = useRef(onSignOut)
  onSignOutRef.current = onSignOut

  useLayoutEffect(() => {
    flushSync(() => {
      onSignOutRef.current()
    })
    navigate('/customer/welcome', { replace: true })
  }, [navigate])

  return (
    <ScreenFrame title="Signing out" subtitle="Customer session" frameClassName="customer-vibe-screen">
      <p className="hint">Redirecting…</p>
    </ScreenFrame>
  )
}

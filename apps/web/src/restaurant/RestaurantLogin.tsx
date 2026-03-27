import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import type { AuthUser, LoginRole } from '../shared/types'

export function RestaurantLogin({
  onLogin,
  sessionUser,
}: {
  onLogin: (role: LoginRole, email: string, password: string) => Promise<AuthUser>
  sessionUser?: AuthUser
}) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const user = await onLogin(
        'RESTAURANT',
        String(form.get('email') ?? ''),
        String(form.get('password') ?? ''),
      )
      setError('')
      if (user.restaurantSubRole === 'KITCHEN') navigate('/restaurant/kds')
      else navigate('/restaurant/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <ScreenFrame title="Restaurant Client Login" subtitle="Owner / Manager / Kitchen Staff (RBAC)">
      <div className="hint">
        Demo: manager@bbq.com / manager123 • kds@bbq.com / kds123 (kitchen)
      </div>
      <form onSubmit={handleSubmit}>
        <label className="field-label">
          Email
          <input className="field" name="email" placeholder="manager@bbq.com" required />
        </label>
        <label className="field-label">
          Password
          <div className="password-field">
            <input
              className="field"
              name="password"
              placeholder="********"
              type={showPassword ? 'text' : 'password'}
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </label>
        <button className="primary-btn" type="submit">
          Login
        </button>
      </form>
      {sessionUser ? <p className="success-text">Logged in as {sessionUser.name}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </ScreenFrame>
  )
}

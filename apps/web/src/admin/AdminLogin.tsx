import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import type { AuthUser, LoginRole } from '../shared/types'

export function AdminLogin({
  platformOwner,
  onLogin,
  sessionUser,
}: {
  platformOwner: { email: string; name: string; passwordHint: string }
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
      await onLogin('ADMIN', String(form.get('email') ?? ''), String(form.get('password') ?? ''))
      setError('')
      navigate('/admin/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <ScreenFrame
      title="Platform Admin Login"
      subtitle="Rifat authorized access only"
      frameClassName="admin-portal-screen"
    >
      <div className="hint">
        Default Owner: {platformOwner.name} ({platformOwner.email}) / {platformOwner.passwordHint}
      </div>
      <form onSubmit={handleSubmit}>
        <label className="field-label">
          Admin Email
          <input
            className="field"
            name="email"
            placeholder="admin@mdrifatul.info"
            defaultValue="admin@mdrifatul.info"
            required
          />
        </label>
        <label className="field-label">
          Password
          <div className="password-field">
            <input
              className="field"
              name="password"
              placeholder="********"
              defaultValue="123456"
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
          Login to Admin Panel
        </button>
      </form>
      {sessionUser ? <p className="success-text">Logged in as {sessionUser.name}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </ScreenFrame>
  )
}

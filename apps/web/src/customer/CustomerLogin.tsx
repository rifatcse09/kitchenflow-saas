import type { FormEvent } from 'react'
import { useState } from 'react'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import type { AuthUser, LoginRole } from '../shared/types'

export function CustomerLogin({
  onLogin,
  sessionUser,
}: {
  onLogin: (role: LoginRole, email: string, password: string) => Promise<AuthUser>
  sessionUser?: AuthUser
}) {
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await onLogin('CUSTOMER', String(form.get('email') ?? ''), String(form.get('password') ?? ''))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <ScreenFrame title="Customer Login" subtitle="Sign in before ordering" frameClassName="customer-vibe-screen">
      <div className="hint">Demo: customer@demo.com / customer123</div>
      <form onSubmit={handleSubmit}>
        <label className="field-label">
          Email
          <input className="field" name="email" placeholder="customer@demo.com" required />
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

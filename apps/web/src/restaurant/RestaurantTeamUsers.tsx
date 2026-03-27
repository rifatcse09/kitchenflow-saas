import type { FormEvent } from 'react'
import { useState } from 'react'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import type { RestaurantTeamUser } from '../shared/types'

export function RestaurantTeamUsers({
  users,
  onAddUser,
}: {
  users: RestaurantTeamUser[]
  onAddUser: (payload: {
    name: string
    email: string
    role: 'MANAGER' | 'STAFF' | 'CASHIER'
    password: string
  }) => Promise<void>
}) {
  const [error, setError] = useState('')

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await onAddUser({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        role: String(form.get('role') ?? 'STAFF') as 'MANAGER' | 'STAFF' | 'CASHIER',
        password: String(form.get('password') ?? ''),
      })
      setError('')
      event.currentTarget.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create user')
    }
  }

  return (
    <ScreenFrame
      title="Team Users & Roles"
      subtitle="Owner can create manager/staff/cashier users after admin approval"
    >
      <form onSubmit={handleAdd} className="inline-form">
        <input className="field" name="name" placeholder="Full name" required />
        <input className="field" name="email" placeholder="user@restaurant.com" required />
        <select className="field" name="role" defaultValue="MANAGER">
          <option value="MANAGER">Manager</option>
          <option value="STAFF">Staff</option>
          <option value="CASHIER">Cashier</option>
        </select>
        <input className="field" name="password" placeholder="Temporary password" required />
        <button className="primary-btn" type="submit">
          Create User
        </button>
      </form>
      {error ? <p className="error-text">{error}</p> : null}

      {users.map((user) => (
        <article className="queue-card" key={user.id}>
          <div>
            <h4>{user.name}</h4>
            <p>
              {user.email} • {user.role}
            </p>
          </div>
          <span className={`status-pill ${user.approved ? 'ready' : 'pending'}`}>
            {user.approved ? 'Approved' : 'Pending'}
          </span>
        </article>
      ))}
    </ScreenFrame>
  )
}

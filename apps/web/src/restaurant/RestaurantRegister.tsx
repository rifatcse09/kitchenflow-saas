import type { FormEvent } from 'react'
import { useState } from 'react'
import { ScreenFrame } from '../shared/components/ScreenFrame'
import type { RestaurantSignupPayload } from '../shared/types'

export function RestaurantRegister({
  onSubmitRegistration,
}: {
  onSubmitRegistration: (payload: RestaurantSignupPayload) => Promise<void>
}) {
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const initialName = String(form.get('initialUserName') ?? '').trim()
    const initialEmail = String(form.get('initialUserEmail') ?? '').trim()
    const initialRole = String(form.get('initialUserRole') ?? '') as 'MANAGER' | 'STAFF' | 'CASHIER'

    const payload: RestaurantSignupPayload = {
      ownerName: String(form.get('ownerName') ?? ''),
      ownerEmail: String(form.get('ownerEmail') ?? ''),
      ownerPassword: String(form.get('ownerPassword') ?? ''),
      restaurantName: String(form.get('restaurantName') ?? ''),
      city: String(form.get('city') ?? ''),
    }
    const initialPassword = String(form.get('initialUserPassword') ?? '').trim()
    if (initialName && initialEmail) {
      payload.initialUserName = initialName
      payload.initialUserEmail = initialEmail
      payload.initialUserRole = initialRole
      if (initialPassword) {
        payload.initialUserPassword = initialPassword
      }
    }
    await onSubmitRegistration(payload)
    event.currentTarget.reset()
    setSubmitted(true)
  }

  return (
    <ScreenFrame
      title="Restaurant Registration"
      subtitle="Submit onboarding request to platform admin"
      frameClassName="restaurant-portal-screen"
    >
      <form onSubmit={handleSubmit}>
        <label className="field-label">
          Owner Name
          <input className="field" name="ownerName" placeholder="Michael Brown" required />
        </label>
        <label className="field-label">
          Owner Email
          <input className="field" name="ownerEmail" placeholder="owner@restaurant.com" required />
        </label>
        <label className="field-label">
          Owner Password
          <input className="field" name="ownerPassword" placeholder="Create password" required />
        </label>
        <label className="field-label">
          Restaurant Name
          <input className="field" name="restaurantName" placeholder="Mike's Grill House" required />
        </label>
        <label className="field-label">
          City
          <input className="field" name="city" placeholder="Houston, TX" required />
        </label>
        <h3 className="section-title">Create first team user (optional)</h3>
        <label className="field-label">
          User Name
          <input className="field" name="initialUserName" placeholder="Kitchen Manager" />
        </label>
        <label className="field-label">
          User Email
          <input className="field" name="initialUserEmail" placeholder="manager@restaurant.com" />
        </label>
        <label className="field-label">
          User Role
          <select className="field" name="initialUserRole" defaultValue="MANAGER">
            <option value="MANAGER">Manager</option>
            <option value="STAFF">Staff</option>
            <option value="CASHIER">Cashier</option>
          </select>
        </label>
        <label className="field-label">
          Initial user password (optional)
          <input
            className="field"
            name="initialUserPassword"
            type="password"
            placeholder="Leave blank to use server default (changeme123)"
            autoComplete="new-password"
          />
        </label>
        <button className="primary-btn" type="submit">
          Submit Registration
        </button>
      </form>

      {submitted ? (
        <p className="success-text">
          Registration submitted. Platform admin must approve before dashboard activation.
        </p>
      ) : null}
    </ScreenFrame>
  )
}

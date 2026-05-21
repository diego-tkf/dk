'use client'

import { useActionState } from 'react'
import { type SignUpState, signUp } from '../api/sign-up'

const initialState: SignUpState = { error: null, success: false }

export function SignUpForm() {
	const [state, formAction, pending] = useActionState(signUp, initialState)

	if (state.success) {
		return (
			<div className="space-y-3">
				<h2 className="font-semibold text-lg">Check your inbox</h2>
				<p className="text-muted-foreground text-sm">We sent you a verification link. Click it to finish signing up.</p>
			</div>
		)
	}

	return (
		<form action={formAction} className="space-y-4">
			<div className="space-y-1.5">
				<label htmlFor="email" className="font-medium text-sm">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					autoComplete="email"
					className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="password" className="font-medium text-sm">
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					minLength={10}
					autoComplete="new-password"
					className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			{state.error && <p className="text-destructive text-sm">{state.error}</p>}

			<button
				type="submit"
				disabled={pending}
				className="w-full rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90 disabled:opacity-50"
			>
				{pending ? 'Creating account…' : 'Create account'}
			</button>
		</form>
	)
}

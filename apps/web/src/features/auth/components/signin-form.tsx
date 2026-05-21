'use client'

import { useActionState } from 'react'
import { type AuthState, signIn } from '../api/sign-in'

const initialState: AuthState = { error: null }

export function SignInForm() {
	const [state, formAction, pending] = useActionState(signIn, initialState)

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
					autoComplete="current-password"
					className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			{state.error && <p className="text-destructive text-sm">{state.error}</p>}

			<button
				type="submit"
				disabled={pending}
				className="w-full rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90 disabled:opacity-50"
			>
				{pending ? 'Signing in…' : 'Sign in'}
			</button>

			<div className="relative pt-2">
				<div className="absolute inset-0 flex items-center pt-2">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center">
					<span className="bg-card px-2 text-muted-foreground text-xs uppercase">or</span>
				</div>
			</div>

			<button
				type="button"
				disabled
				title="Microsoft sign-in is not yet enabled. Pending Azure app registration."
				className="w-full rounded-md border bg-background px-3 py-2 font-medium text-sm disabled:cursor-not-allowed disabled:opacity-50"
			>
				Sign in with Microsoft (coming soon)
			</button>
		</form>
	)
}

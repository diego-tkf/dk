'use server'

import { createClient } from '@/lib/supabase/server'

export interface SignUpState {
	error: string | null
	success: boolean
}

const MIN_PASSWORD_LENGTH = 10

export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
	const email = formData.get('email')
	const password = formData.get('password')

	if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
		return { error: 'Email and password are required.', success: false }
	}

	if (password.length < MIN_PASSWORD_LENGTH) {
		return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, success: false }
	}

	const supabase = await createClient()
	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
		},
	})

	if (error) return { error: error.message, success: false }

	return { error: null, success: true }
}

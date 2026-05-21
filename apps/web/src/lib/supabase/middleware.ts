import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { requireEnv } from '@/lib/env'

interface CookieEntry {
	name: string
	value: string
	options: CookieOptions
}

/**
 * Refresh the auth session on every request. Called from the root middleware.
 *
 * Critical: must call supabase.auth.getUser() between server client
 * instantiation and the response — that's what triggers token refresh and
 * cookie rotation. Skipping it means stale sessions.
 */
export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({ request })

	const supabase = createServerClient(
		requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
		requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
		{
			cookies: {
				getAll() {
					return request.cookies.getAll()
				},
				setAll(cookiesToSet: CookieEntry[]) {
					for (const { name, value } of cookiesToSet) {
						request.cookies.set(name, value)
					}
					supabaseResponse = NextResponse.next({ request })
					for (const { name, value, options } of cookiesToSet) {
						supabaseResponse.cookies.set(name, value, options)
					}
				},
			},
		},
	)

	await supabase.auth.getUser()

	return supabaseResponse
}

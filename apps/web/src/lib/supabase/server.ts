import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { requireEnv } from '@/lib/env'

interface CookieEntry {
	name: string
	value: string
	options: CookieOptions
}

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Reads + writes session cookies via Next.js's cookies() store.
 *
 * Per @supabase/ssr docs: setAll may throw in pure Server Components (cookies
 * are immutable there); swallow because middleware refreshes the session
 * before the next request lands.
 */
export async function createClient() {
	const cookieStore = await cookies()

	return createServerClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
		cookies: {
			getAll() {
				return cookieStore.getAll()
			},
			setAll(cookiesToSet: CookieEntry[]) {
				try {
					for (const { name, value, options } of cookiesToSet) {
						cookieStore.set(name, value, options)
					}
				} catch {
					// Called from Server Component; ignore. Middleware refreshes session.
				}
			},
		},
	})
}

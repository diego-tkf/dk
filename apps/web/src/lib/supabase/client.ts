import { createBrowserClient } from '@supabase/ssr'
import { requireEnv } from '@/lib/env'

/**
 * Supabase client for Client Components. Safe to call from React render —
 * @supabase/ssr handles singleton caching internally per page navigation.
 */
export function createClient() {
	return createBrowserClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'))
}

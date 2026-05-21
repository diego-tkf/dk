import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
	return await updateSession(request)
}

export const config = {
	matcher: [
		/*
		 * Run on all paths except:
		 * - _next/static, _next/image (Next internals)
		 * - favicon, common image files (static assets)
		 * - api routes (they manage their own auth)
		 */
		'/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}

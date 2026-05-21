/**
 * Tiny env accessor. Throws a clear error at boot if a required var is
 * missing, instead of letting downstream code call .signIn() with `undefined`
 * and emit a cryptic Supabase error.
 *
 * When we add a proper env-validation slice (Zod schema covering all vars),
 * this file goes away in favor of a typed `env` object.
 */
export function requireEnv(name: string): string {
	const value = process.env[name]
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`)
	}
	return value
}

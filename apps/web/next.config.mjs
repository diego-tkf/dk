/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Transpile @dk/* workspace packages so Next.js handles their TS source directly
	// (matches the source-first export convention; no separate build step needed).
	transpilePackages: ['@dk/schemas', '@dk/db', '@dk/audit'],
}

export default nextConfig

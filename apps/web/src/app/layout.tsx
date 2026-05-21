import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
	title: 'dk',
	description: 'Internal platform for AI-powered creative tools',
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-background text-foreground antialiased">{children}</body>
		</html>
	)
}

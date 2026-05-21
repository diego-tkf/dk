import Link from 'next/link'
import { SignInForm } from '@/features/auth/components/signin-form'

export default function SignInPage() {
	return (
		<>
			<h1 className="mb-1 font-semibold text-2xl">Sign in</h1>
			<p className="mb-6 text-muted-foreground text-sm">Welcome back.</p>
			<SignInForm />
			<p className="mt-6 text-muted-foreground text-sm">
				New here?{' '}
				<Link href="/signup" className="underline">
					Create an account
				</Link>
			</p>
		</>
	)
}

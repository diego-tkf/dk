import Link from 'next/link'
import { SignUpForm } from '@/features/auth/components/signup-form'

export default function SignUpPage() {
	return (
		<>
			<h1 className="mb-1 font-semibold text-2xl">Create your account</h1>
			<p className="mb-6 text-muted-foreground text-sm">10+ character password. We'll send a verification email.</p>
			<SignUpForm />
			<p className="mt-6 text-muted-foreground text-sm">
				Already have an account?{' '}
				<Link href="/signin" className="underline">
					Sign in
				</Link>
			</p>
		</>
	)
}

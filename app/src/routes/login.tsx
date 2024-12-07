import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/utils/auth'
import { FALLBACK_PATH } from '@/utils/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
	useRouterState
} from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/login')({
	component: RouteComponent,
	validateSearch: z.object({
		redirect: z.string().optional().catch('')
	}),
	beforeLoad: ({ context, search }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: search.redirect || FALLBACK_PATH })
		}
	}
})

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
})

function RouteComponent() {
	const auth = useAuth()
	const router = useRouter()
	const isLoading = useRouterState({ select: (s) => s.isLoading })
	const navigate = Route.useNavigate()
	const search = Route.useSearch()
	const [error, setError] = useState<string | null>(null)

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	})

	const onSubmit = async (data: z.infer<typeof loginSchema>) => {
		try {
			setError(null)
			await auth.login(data.email, data.password)
			await router.invalidate()
			await navigate({ to: search.redirect || FALLBACK_PATH })
		} catch (err) {
			setError((err as Error).message)
		}
	}

	return (
		<div className="container mx-auto max-w-md p-4">
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">Login</CardTitle>
					<CardDescription>
						Enter your email and password to access your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-6">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								rules={{
									required: 'Email is required',
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: 'Invalid email address'
									}
								}}
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter your email"
												type="email"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								rules={{
									required: 'Password is required',
									minLength: {
										value: 8,
										message: 'Password must be at least 8 characters'
									}
								}}
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter your password"
												type="password"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Logging in...
									</>
								) : (
									'Login'
								)}
							</Button>
						</form>
					</Form>

					<div className="mt-4 text-center text-sm">
						Don't have an account?{' '}
						<Link to="/register" className="text-primary hover:underline">
							Register
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default RouteComponent

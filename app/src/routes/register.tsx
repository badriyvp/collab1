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
import { api, FALLBACK_PATH } from '@/utils/constants'
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

export const Route = createFileRoute('/register')({
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

const registerSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters')
})

function RouteComponent() {
	const auth = useAuth()
	const router = useRouter()
	const isLoading = useRouterState({ select: (s) => s.isLoading })
	const navigate = Route.useNavigate()
	const search = Route.useSearch()
	const [error, setError] = useState<string | null>(null)

	const form = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: ''
		}
	})

	const onSubmit = async (data: z.infer<typeof registerSchema>) => {
		try {
			setError(null)
			const res = await api.post('/auth/register', data)

			if (res.status !== 201) {
				setError(res.data.message || 'Registration failed. Please try again.')
				return
			}

			await auth.login(data.email, data.password)
			await router.invalidate()
			await navigate({ to: search.redirect || FALLBACK_PATH })
		} catch (err) {
			console.log(err)
			setError(
				(err as any).response.data.message ||
					'Registration failed. Please try again.'
			)
		}
	}

	return (
		<div className="container mx-auto max-w-md p-4">
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">Create account</CardTitle>
					<CardDescription>
						Enter your details to create a new account
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
								name="name"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter your full name"
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
								name="email"
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
										Creating account...
									</>
								) : (
									'Create account'
								)}
							</Button>
						</form>
					</Form>

					<div className="mt-4 text-center text-sm">
						Already have an account?{' '}
						<Link to="/login" className="text-primary hover:underline">
							Login
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default RouteComponent

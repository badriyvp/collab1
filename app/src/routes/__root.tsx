import NavLink from '@/components/nav-link'
import { Button } from '@/components/ui/button'
import { AuthContext, useAuth } from '@/utils/auth'
import {
	Link,
	Outlet,
	createRootRouteWithContext
} from '@tanstack/react-router'

interface AppRouterContext {
	auth: AuthContext
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
	component: RootComponent
})

function RootComponent() {
	const auth = useAuth()

	const handleLogout = async () => await auth.logout()

	return (
		<>
			<div className="antialiased min-h-screen flex flex-col max-w-screen-md mx-auto">
				<header className="p-4 flex items-center gap-x-2 justify-between">
					<Link to="/">ImageGen</Link>
					<nav className="flex items-center gap-x-2 text-sm">
						<NavLink to="/">Home</NavLink>
						{auth.isAuthenticated ? (
							<>
								<Button onClick={handleLogout} variant="destructive" size="sm">
									Logout
								</Button>
							</>
						) : (
							<NavLink to="/login">Login</NavLink>
						)}
					</nav>
				</header>
				<main className="flex-grow px-4 py-8 max-w-screen-sm mx-auto w-full">
					<Outlet />
				</main>
				<footer className="p-4 text-center text-sm text-neutral-500">
					&copy; 2024, ImageGen, All Rights Reserved
				</footer>
			</div>
		</>
	)
}

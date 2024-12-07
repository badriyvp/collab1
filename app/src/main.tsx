import '@/index.css'
import { routeTree } from '@/routeTree.gen'
import { AuthProvider, useAuth } from '@/utils/auth'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const router = createRouter({
	routeTree,
	defaultPreload: 'intent',
	context: {
		auth: undefined!
	}
})

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

const App = () => {
	const auth = useAuth()
	return <RouterProvider router={router} context={{ auth }} />
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</StrictMode>
)

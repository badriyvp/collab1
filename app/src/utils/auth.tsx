import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState
} from 'react'
import { API_URL } from './constants'

export interface User {
	id: string
	name: string
	email: string
	createdAt: string
	updatedAt: string
}

export interface AuthContext {
	isAuthenticated: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => Promise<void>
	user: User | null
}

const AuthContext = createContext<AuthContext | null>(null)

const authToken = 'auth_token'

export function getStoredToken(): string | null {
	return localStorage.getItem(authToken)
}

function setStoredToken(token: string | null) {
	if (token) {
		localStorage.setItem(authToken, token)
	} else {
		localStorage.removeItem(authToken)
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [token, setToken] = useState<string | null>(getStoredToken())
	const isAuthenticated = !!token

	const logout = useCallback(async () => {
		setStoredToken(null)
		setToken(null)
		setUser(null)
	}, [])

	const login = useCallback(
		async (email: string, password: string): Promise<void> => {
			const response = await fetch(`${API_URL}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			})

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.message || 'Failed to log in')
			}

			const { token } = await response.json()
			setStoredToken(token)
			setToken(token)
			await fetchUserData(token)
		},
		[]
	)

	const fetchUserData = useCallback(async (token: string) => {
		const response = await fetch(`${API_URL}/auth/user`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})

		if (!response.ok) {
			throw new Error('Failed to fetch user data')
		}

		const userData: User = await response.json()
		setUser(userData)
	}, [])

	useEffect(() => {
		if (token) {
			fetchUserData(token)
		}
	}, [token, fetchUserData])

	return (
		<AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)

	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}

	return context
}

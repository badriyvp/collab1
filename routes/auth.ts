import { compare, genSalt, hash } from 'bcryptjs'
import type { Request, Response } from 'express'
import { Router } from 'express'
import { sign } from 'jsonwebtoken'
import { db } from '../db'
import { users } from '../db/schema'
import { verifyToken } from '../lib/middleware'

const router = Router()

router.post('/login', async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body

		// check if the user exists
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, email)
		})

		if (!user) {
			res.status(400).json({ message: 'User not found' })
			return
		}

		// check if the password is correct
		const passwordMatch = await compare(password, user.passwordHash)
		if (!passwordMatch) {
			res.status(400).json({ message: 'Invalid password' })
			return
		}

		const token = sign({ userId: user.id }, process.env.JWT_SECRET!, {
			expiresIn: '1h'
		})

		res.status(200).json({ token })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
})

router.post('/register', async (req: Request, res: Response) => {
	try {
		const { name, email, password } = req.body

		// check if the user exists
		const existingUser = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, email)
		})

		if (existingUser) {
			res.status(400).json({ message: 'User already exists' })
			return
		}

		// create the user
		await db.insert(users).values({
			name,
			email,
			passwordHash: await hash(password, await genSalt(10))
		})

		res.status(201).json({ success: true })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
})

router.get('/user', verifyToken as any, async (req: Request, res: Response) => {
	try {
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, (req as any).userId),
			columns: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true
			}
		})

		if (!user) {
			res.status(400).json({ message: 'User not found' })
			return
		}

		res.status(200).json(user)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
})

export default router

import type { Request, Response } from 'express'
import { verify, type JwtPayload } from 'jsonwebtoken'

export function verifyToken(req: Request, res: Response, next: () => void) {
	const token = req.headers.authorization?.split(' ')[1]
	if (!token) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	verify(token, process.env.JWT_SECRET!, (err, decoded) => {
		if (err) {
			return res.status(403).json({ error: 'Invalid token' })
		}
		;(req as any).userId = (decoded as JwtPayload).userId
		next()
	})
}

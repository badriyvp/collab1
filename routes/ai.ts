import type { Request, Response } from 'express'
import { Router } from 'express'
import OpenAI from 'openai'
import { verifyToken } from '../lib/middleware'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

const router = Router()

router.post('/', verifyToken as any, async (req: Request, res: Response) => {
	try {
		const { prompt } = req.body

		const response = await openai.images.generate({
			model: 'dall-e-3',
			prompt,
			n: 1,
			size: '1792x1024'
		})

		res.status(200).json({ data: response.data })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Internal Server Error' })
	}
})

export default router

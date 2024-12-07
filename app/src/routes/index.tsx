import { Button, buttonVariants } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { getStoredToken, useAuth } from '@/utils/auth'
import { api } from '@/utils/constants'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2, Maximize2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
	component: RouteComponent
})

function RouteComponent() {
	const auth = useAuth()
	const [loading, setLoading] = useState(false)
	const [data, setData] = useState<{
		imageUrl: string
		description: string
	} | null>(null)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		setLoading(true)
		try {
			const formData = new FormData(e.currentTarget)
			console.log(formData.get('prompt'))

			const res = await api.post(
				'/ai',
				{ prompt: formData.get('prompt') },
				{
					headers: {
						Authorization: `Bearer ${getStoredToken()}`
					}
				}
			)

			if (res.status !== 200) {
				console.error(res.statusText)
				return
			}

			const json = res.data
			setData({
				imageUrl: json.data[0].url,
				description: json.data[0].revised_prompt
			})
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="container mx-auto max-w-2xl p-4 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">
						{auth.isAuthenticated
							? `Welcome back, ${auth.user?.name}!`
							: 'AI Image Generator'}
					</CardTitle>
					<CardDescription>Create unique images using DALL·E-3</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="prompt"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Generate image of
							</label>
							<Textarea
								name="prompt"
								id="prompt"
								required
								placeholder="a white siamese cat"
								disabled={!auth.isAuthenticated}
								className="min-h-[100px] resize-none"
							/>
						</div>

						{auth.isAuthenticated ? (
							<Button type="submit" disabled={loading}>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Please wait...
									</>
								) : (
									'Generate Image'
								)}
							</Button>
						) : (
							<Link
								to="/login"
								className={buttonVariants({ variant: 'secondary' })}
							>
								Login to continue
							</Link>
						)}
					</form>
				</CardContent>
			</Card>

			{data && auth.isAuthenticated && (
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-4">
							<div className="relative rounded-lg overflow-hidden">
								<img
									src={data.imageUrl}
									alt={data.description}
									className="w-full aspect-video object-cover"
								/>
								<Dialog>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											className="absolute bottom-2 right-2"
										>
											<Maximize2 className="h-4 w-4" />
										</Button>
									</DialogTrigger>
									<DialogContent className="max-w-4xl">
										<div className="relative">
											<img
												src={data.imageUrl}
												alt={data.description}
												className="w-full rounded-lg"
											/>
										</div>
									</DialogContent>
								</Dialog>
							</div>
							<p className="text-sm text-muted-foreground">
								{data.description}
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

export default RouteComponent

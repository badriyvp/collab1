import { Link, useLocation } from '@tanstack/react-router'
import { twJoin } from 'tailwind-merge'

interface NavLinkProps {
	to: string
	children: Readonly<React.ReactNode>
}

export default function NavLink(props: NavLinkProps) {
	const { pathname } = useLocation()

	return (
		<Link
			to={props.to}
			className={twJoin(
				pathname === props.to
					? 'bg-neutral-100 border-neutral-200 font-medium'
					: 'border-transparent',
				'px-2 py-1 rounded-md hover:bg-neutral-200 border'
			)}
		>
			{props.children}
		</Link>
	)
}

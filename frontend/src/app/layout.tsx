import type { Metadata } from 'next'
import { ReactNode } from 'react'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
	title: 'Passport Seva Portal',
	description: 'Passport application workflow built with Next.js',
}

interface RootLayoutProps {
	children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang='en'>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}

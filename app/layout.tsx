import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Julian Gilliatt',
    template: '%s | Julian Gilliatt',
  },
  description: 'Personal website and portfolio',
}

// Feature flag for Clerk authentication
const ENABLE_CLERK = process.env.ENABLE_CLERK === 'true'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.className}>
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
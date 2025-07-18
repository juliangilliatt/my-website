import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono, Fira_Code } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { NavigationProvider } from '@/hooks/useNavigation'
import { NavigationLayout } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'My Website',
    template: '%s | My Website',
  },
  description: 'A brutalist portfolio website with recipes and blog',
  keywords: ['portfolio', 'recipes', 'blog', 'developer'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: 'My Website',
    description: 'A brutalist portfolio website with recipes and blog',
    siteName: 'My Website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Website',
    description: 'A brutalist portfolio website with recipes and blog',
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable} ${firaCode.variable}`}>
        <body className="font-sans antialiased">
          <NavigationProvider>
            <NavigationLayout>
              {children}
            </NavigationLayout>
            <Footer />
          </NavigationProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
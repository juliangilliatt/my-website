import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ClerkProvider } from '@clerk/nextjs'
import { requireAdmin } from '@/lib/auth/admin-guards'
import { AdminNav } from '@/components/admin/AdminNav'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Admin Dashboard - ${SITE_CONFIG.name}`,
  description: 'Admin dashboard for managing recipes, blog posts, and site content.',
  robots: 'noindex, nofollow',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side admin authentication check
  try {
    await requireAdmin()
  } catch (error) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Admin Navigation */}
      <AdminNav />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
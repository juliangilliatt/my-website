import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
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
  // Check if user is authenticated
  const { userId } = auth()
  
  if (!userId) {
    redirect('/auth/sign-in')
  }

  // For single-admin setup, any authenticated user is admin
  // In a multi-user setup, you'd check for admin role here

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
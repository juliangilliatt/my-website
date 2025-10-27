import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { AdminBreadcrumb } from '@/components/admin/AdminNav'
import { StatsCards } from '@/components/admin/StatsCards'
import { QuickActions } from '@/components/admin/QuickActions'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Admin Dashboard - ${SITE_CONFIG.name}`,
  description: 'Admin dashboard overview with statistics and quick actions.',
  robots: 'noindex, nofollow',
}

export default async function AdminDashboard() {
  // Get authenticated user (auth check is in layout)
  const session = await auth()
  const user = session?.user

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-black">Dashboard</h1>
          <p className="text-neutral-600 font-mono">
            Welcome back, {user?.name || 'Admin'}
          </p>
        </div>
        <AdminBreadcrumb items={[{ name: 'Dashboard' }]} />
      </div>

      {/* Main Stats Cards */}
      <StatsCards />

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-mono font-bold text-black mb-4">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  )
}

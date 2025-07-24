import { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { AdminBreadcrumb } from '@/components/admin/AdminNav'
import { StatsCards, DetailedStatsCards, RecentActivityStats } from '@/components/admin/StatsCards'
import { QuickActions, RecentTasks, SystemActions } from '@/components/admin/QuickActions'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
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
      <Suspense fallback={<LoadingSpinner className="w-8 h-8 mx-auto" />}>
        <StatsCards />
      </Suspense>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-mono font-bold text-black mb-4">Quick Actions</h2>
        <Suspense fallback={<LoadingSpinner className="w-8 h-8 mx-auto" />}>
          <QuickActions />
        </Suspense>
      </div>

      {/* Detailed Stats */}
      <div>
        <h2 className="text-xl font-mono font-bold text-black mb-4">Detailed Overview</h2>
        <Suspense fallback={<LoadingSpinner className="w-8 h-8 mx-auto" />}>
          <DetailedStatsCards />
        </Suspense>
      </div>

      {/* Recent Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<LoadingSpinner className="w-8 h-8 mx-auto" />}>
          <RecentActivityStats />
        </Suspense>
        <Suspense fallback={<LoadingSpinner className="w-8 h-8 mx-auto" />}>
          <RecentTasks />
        </Suspense>
      </div>

      {/* System Actions */}
      <div>
        <h2 className="text-xl font-mono font-bold text-black mb-4">System Management</h2>
        <Suspense fallback={<LoadingSpinner className="w-8 h-8 mx-auto" />}>
          <SystemActions />
        </Suspense>
      </div>
    </div>
  )
}
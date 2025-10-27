'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAdminStats } from '@/hooks/useAdminAuth'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  className?: string
}

export function StatsCards({ className }: StatsCardsProps) {
  const stats = useAdminStats()

  if (stats.isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded mb-2"></div>
            <div className="h-8 bg-neutral-200 rounded mb-2"></div>
            <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    )
  }

  if (stats.error) {
    return (
      <div className={cn('p-6 text-center', className)}>
        <p className="text-red-600 font-mono">Error loading statistics: {stats.error}</p>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', className)}>
      <StatCard
        title="Total Recipes"
        value={stats.totalRecipes}
        icon={<RecipeIcon className="w-6 h-6" />}
        color="bg-blue-100 text-blue-800 border-blue-500"
        trend={{ value: 12, type: 'increase' }}
      />

      <StatCard
        title="Blog Posts"
        value={stats.totalBlogPosts}
        icon={<BlogIcon className="w-6 h-6" />}
        color="bg-green-100 text-green-800 border-green-500"
        trend={{ value: 8, type: 'increase' }}
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  trend?: {
    value: number
    type: 'increase' | 'decrease'
  }
  className?: string
}

function StatCard({ title, value, icon, color, trend, className }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const increment = value / 30
      const counter = setInterval(() => {
        start += increment
        if (start >= value) {
          setDisplayValue(value)
          clearInterval(counter)
        } else {
          setDisplayValue(Math.floor(start))
        }
      }, 50)
    }, 100)

    return () => clearTimeout(timer)
  }, [value])

  return (
    <Card className={cn('p-6 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-lg border-2 shadow-brutal-sm', color)}>
          {icon}
        </div>
        {trend && (
          <Badge variant="outline" className={cn('font-mono text-xs', 
            trend.type === 'increase' ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.type === 'increase' ? '+' : '-'}{trend.value}%
          </Badge>
        )}
      </div>
      
      <div className="mb-2">
        <div className="text-2xl font-mono font-bold text-black">
          {displayValue.toLocaleString()}
        </div>
        <div className="text-sm font-mono text-neutral-600">{title}</div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-1">
          {trend.type === 'increase' ? (
            <TrendUpIcon className="w-4 h-4 text-green-600" />
          ) : (
            <TrendDownIcon className="w-4 h-4 text-red-600" />
          )}
          <span className={cn('text-xs font-mono', 
            trend.type === 'increase' ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.value}% from last month
          </span>
        </div>
      )}
    </Card>
  )
}

// Detailed stats cards with charts
export function DetailedStatsCards({ className }: { className?: string }) {
  const stats = useAdminStats()
  
  if (stats.isLoading) {
    return <LoadingSpinner className="w-8 h-8 mx-auto" />
  }

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6', className)}>
      <Card className="p-6 bg-white border-2 border-black shadow-brutal">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-mono font-bold text-black">Content Overview</h3>
          <ContentIcon className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-neutral-600">Recipes</span>
            <span className="text-lg font-mono font-bold text-black">{stats.totalRecipes}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-neutral-600">Blog Posts</span>
            <span className="text-lg font-mono font-bold text-black">{stats.totalBlogPosts}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-neutral-600">Total Content</span>
            <span className="text-lg font-mono font-bold text-primary-600">
              {stats.totalRecipes + stats.totalBlogPosts}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white border-2 border-black shadow-brutal">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-mono font-bold text-black">User Engagement</h3>
          <EngagementIcon className="w-6 h-6 text-green-600" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-neutral-600">Total Users</span>
            <span className="text-lg font-mono font-bold text-black">{stats.totalUsers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-neutral-600">Page Views</span>
            <span className="text-lg font-mono font-bold text-black">{stats.totalViews.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-neutral-600">Avg. per User</span>
            <span className="text-lg font-mono font-bold text-green-600">
              {Math.round(stats.totalViews / stats.totalUsers)}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white border-2 border-black shadow-brutal">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-mono font-bold text-black">Performance</h3>
          <PerformanceIcon className="w-6 h-6 text-purple-600" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-neutral-600">Response Time</span>
            <Badge variant="outline" className="font-mono text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              145ms
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-neutral-600">Uptime</span>
            <Badge variant="outline" className="font-mono text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              99.9%
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-neutral-600">Error Rate</span>
            <Badge variant="outline" className="font-mono text-xs text-yellow-600">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
              0.1%
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Recent activity stats
export function RecentActivityStats({ className }: { className?: string }) {
  const stats = useAdminStats()

  if (stats.isLoading) {
    return <LoadingSpinner className="w-8 h-8 mx-auto" />
  }

  return (
    <Card className={cn('p-6 bg-white border-2 border-black shadow-brutal', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-mono font-bold text-black">Recent Activity</h3>
        <Badge variant="outline" className="font-mono text-xs">
          Last 24 hours
        </Badge>
      </div>
      
      <div className="space-y-4">
        {stats.recentActivity.map((activity, index) => (
          <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-neutral-50 transition-colors duration-150">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-medium text-black">
                  {activity.action}
                </span>
                <span className="text-xs font-mono text-neutral-600">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              <div className="text-xs font-mono text-neutral-600">
                {activity.resource} by {activity.user}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Chart-based stats cards
export function ChartStatsCards({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      <Card className="p-6 bg-white border-2 border-black shadow-brutal">
        <h3 className="text-lg font-mono font-bold text-black mb-4">Content Growth</h3>
        <div className="h-40 bg-neutral-50 border-2 border-black flex items-center justify-center">
          <span className="text-neutral-600 font-mono text-sm">Chart placeholder</span>
        </div>
      </Card>

      <Card className="p-6 bg-white border-2 border-black shadow-brutal">
        <h3 className="text-lg font-mono font-bold text-black mb-4">User Activity</h3>
        <div className="h-40 bg-neutral-50 border-2 border-black flex items-center justify-center">
          <span className="text-neutral-600 font-mono text-sm">Chart placeholder</span>
        </div>
      </Card>
    </div>
  )
}

// Utility function to format time ago
function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMs = now.getTime() - time.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 30) return `${diffInDays}d ago`
  return time.toLocaleDateString()
}

// Icon components
function RecipeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}

function BlogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  )
}

function ViewsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  )
}

function ContentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function EngagementIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function PerformanceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAdminAuth, useAdminActions } from '@/hooks/useAdminAuth'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  const { checkPermission } = useAdminAuth()
  const { executeAction } = useAdminActions()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleAction = async (actionId: string, action: () => Promise<void>) => {
    setIsLoading(actionId)
    try {
      await action()
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const actions = [
    {
      id: 'create-recipe',
      name: 'Create Recipe',
      description: 'Add a new recipe to the collection',
      icon: <PlusIcon className="w-5 h-5" />,
      color: 'bg-green-500 text-white',
      href: '/admin/recipes/create',
      permission: 'recipes:create',
    },
    {
      id: 'create-blog',
      name: 'Write Blog Post',
      description: 'Publish a new blog article',
      icon: <EditIcon className="w-5 h-5" />,
      color: 'bg-blue-500 text-white',
      href: '/admin/blog/create',
      permission: 'blog:create',
    },
    {
      id: 'manage-users',
      name: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <UsersIcon className="w-5 h-5" />,
      color: 'bg-purple-500 text-white',
      href: '/admin/users',
      permission: 'users:read',
    },
    {
      id: 'view-analytics',
      name: 'View Analytics',
      description: 'Check site performance metrics',
      icon: <AnalyticsIcon className="w-5 h-5" />,
      color: 'bg-orange-500 text-white',
      href: '/admin/analytics',
      permission: 'analytics:read',
    },
    {
      id: 'backup-data',
      name: 'Backup Data',
      description: 'Create a backup of all data',
      icon: <BackupIcon className="w-5 h-5" />,
      color: 'bg-gray-500 text-white',
      permission: 'admin:manage',
      action: async () => {
        await executeAction('backup', 'database', async () => {
          // Simulate backup process
          await new Promise(resolve => setTimeout(resolve, 2000))
          alert('Backup completed successfully!')
        })
      },
    },
    {
      id: 'clear-cache',
      name: 'Clear Cache',
      description: 'Clear application cache',
      icon: <RefreshIcon className="w-5 h-5" />,
      color: 'bg-red-500 text-white',
      permission: 'admin:manage',
      action: async () => {
        await executeAction('clear_cache', 'system', async () => {
          // Simulate cache clearing
          await new Promise(resolve => setTimeout(resolve, 1000))
          alert('Cache cleared successfully!')
        })
      },
    },
  ]

  const visibleActions = actions.filter(action => 
    checkPermission(action.permission as any)
  )

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {visibleActions.map((action) => (
        <QuickActionCard
          key={action.id}
          action={action}
          isLoading={isLoading === action.id}
          onAction={action.action ? () => handleAction(action.id, action.action!) : undefined}
        />
      ))}
    </div>
  )
}

interface QuickActionCardProps {
  action: {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    color: string
    href?: string
    action?: () => Promise<void>
  }
  isLoading: boolean
  onAction?: () => void
}

function QuickActionCard({ action, isLoading, onAction }: QuickActionCardProps) {
  const CardContent = (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('p-2 rounded-lg border-2 border-black shadow-brutal-sm', action.color)}>
          {action.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-mono font-semibold text-black">{action.name}</h3>
          <p className="text-sm font-mono text-neutral-600">{action.description}</p>
        </div>
      </div>
      
      <div className="mt-auto">
        {action.href ? (
          <Link href={action.href} className="block w-full">
            <Button variant="outline" className="w-full font-mono text-sm">
              {action.name}
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            className="w-full font-mono text-sm"
            onClick={onAction}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : action.name}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <Card className="bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all duration-150 cursor-pointer">
      {CardContent}
    </Card>
  )
}

// Recent tasks component
export function RecentTasks({ className }: { className?: string }) {
  const tasks = [
    {
      id: '1',
      title: 'Review new recipe submissions',
      status: 'pending',
      priority: 'high',
      dueDate: '2024-01-15',
      assignee: 'Admin',
    },
    {
      id: '2',
      title: 'Update blog post categories',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-01-16',
      assignee: 'Editor',
    },
    {
      id: '3',
      title: 'Backup database',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-01-14',
      assignee: 'System',
    },
    {
      id: '4',
      title: 'Optimize image compression',
      status: 'pending',
      priority: 'low',
      dueDate: '2024-01-18',
      assignee: 'Developer',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <Card className={cn('p-6 bg-white border-2 border-black shadow-brutal', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-mono font-bold text-black">Recent Tasks</h3>
        <Link href="/admin/tasks">
          <Button variant="ghost" size="sm" className="font-mono text-sm">
            View All
          </Button>
        </Link>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-3 hover:bg-neutral-50 transition-colors duration-150">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-mono font-medium text-black">{task.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('font-mono text-xs', getStatusColor(task.status))}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className={cn('font-mono text-xs', getPriorityColor(task.priority))}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-neutral-600">
                <span>Due: {task.dueDate}</span>
                <span>Assignee: {task.assignee}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="p-1">
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

// System actions component
export function SystemActions({ className }: { className?: string }) {
  const { checkPermission } = useAdminAuth()
  const { executeAction } = useAdminActions()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const systemActions = [
    {
      id: 'sync-data',
      name: 'Sync Data',
      description: 'Synchronize data with external sources',
      icon: <SyncIcon className="w-4 h-4" />,
      permission: 'admin:manage',
      action: async () => {
        await executeAction('sync_data', 'system', async () => {
          await new Promise(resolve => setTimeout(resolve, 3000))
          alert('Data sync completed!')
        })
      },
    },
    {
      id: 'rebuild-search',
      name: 'Rebuild Search Index',
      description: 'Rebuild the search index for better performance',
      icon: <SearchIcon className="w-4 h-4" />,
      permission: 'admin:manage',
      action: async () => {
        await executeAction('rebuild_search', 'system', async () => {
          await new Promise(resolve => setTimeout(resolve, 2000))
          alert('Search index rebuilt!')
        })
      },
    },
    {
      id: 'optimize-images',
      name: 'Optimize Images',
      description: 'Compress and optimize all images',
      icon: <ImageIcon className="w-4 h-4" />,
      permission: 'admin:manage',
      action: async () => {
        await executeAction('optimize_images', 'system', async () => {
          await new Promise(resolve => setTimeout(resolve, 4000))
          alert('Images optimized!')
        })
      },
    },
    {
      id: 'generate-sitemap',
      name: 'Generate Sitemap',
      description: 'Generate XML sitemap for SEO',
      icon: <SitemapIcon className="w-4 h-4" />,
      permission: 'admin:manage',
      action: async () => {
        await executeAction('generate_sitemap', 'system', async () => {
          await new Promise(resolve => setTimeout(resolve, 1000))
          alert('Sitemap generated!')
        })
      },
    },
  ]

  const visibleActions = systemActions.filter(action => 
    checkPermission(action.permission as any)
  )

  const handleAction = async (actionId: string, action: () => Promise<void>) => {
    setIsLoading(actionId)
    try {
      await action()
    } catch (error) {
      console.error('System action failed:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Card className={cn('p-6 bg-white border-2 border-black shadow-brutal', className)}>
      <h3 className="text-lg font-mono font-bold text-black mb-4">System Actions</h3>
      
      <div className="space-y-3">
        {visibleActions.map((action) => (
          <div key={action.id} className="flex items-center justify-between p-3 hover:bg-neutral-50 transition-colors duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 border-2 border-black shadow-brutal-sm">
                {action.icon}
              </div>
              <div>
                <h4 className="font-mono font-medium text-black">{action.name}</h4>
                <p className="text-sm font-mono text-neutral-600">{action.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction(action.id, action.action)}
              disabled={isLoading === action.id}
              className="font-mono text-sm"
            >
              {isLoading === action.id ? 'Running...' : 'Run'}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Icon components
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function BackupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function SyncIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function SitemapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}
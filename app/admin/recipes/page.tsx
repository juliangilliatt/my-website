import { Metadata } from 'next'
import Link from 'next/link'
import { AdminBreadcrumb } from '@/components/admin/AdminNav'
import { RecipeTable } from '@/components/admin/RecipeTable'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Recipe Management - Admin - ${SITE_CONFIG.name}`,
  description: 'Manage recipes, categories, and content.',
  robots: 'noindex, nofollow',
}

interface RecipeManagementPageProps {
  searchParams: {
    q?: string
    category?: string
    status?: 'all' | 'published' | 'draft'
    page?: string
  }
}

export default async function RecipeManagementPage({ searchParams }: RecipeManagementPageProps) {
  // Auth check is handled in layout

  const { q: searchQuery, category, status = 'all', page = '1' } = searchParams
  const currentPage = parseInt(page)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-black">Recipe Management</h1>
          <p className="text-neutral-600 font-mono">
            Manage all recipes, categories, and content
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AdminBreadcrumb 
            items={[
              { name: 'Recipes', href: '/admin/recipes' }
            ]} 
          />
          <Link href="/admin/recipes/create">
            <Button className="font-mono">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Recipe
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <RecipeSearchForm initialQuery={searchQuery} />
          </div>
          <div className="flex items-center gap-4">
            <RecipeFilters 
              selectedCategory={category}
              selectedStatus={status}
            />
          </div>
        </div>
      </Card>

      {/* Recipe Table */}
      <RecipeTable
        searchQuery={searchQuery}
        categoryFilter={category}
        statusFilter={status}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-mono font-bold text-black">42</div>
          <div className="text-sm font-mono text-neutral-600">Total Recipes</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-mono font-bold text-green-600">38</div>
          <div className="text-sm font-mono text-neutral-600">Published</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-mono font-bold text-yellow-600">4</div>
          <div className="text-sm font-mono text-neutral-600">Drafts</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-mono font-bold text-blue-600">8</div>
          <div className="text-sm font-mono text-neutral-600">Categories</div>
        </Card>
      </div>
    </div>
  )
}

// Search form component
function RecipeSearchForm({ initialQuery }: { initialQuery?: string }) {
  return (
    <form className="relative">
      <input
        type="text"
        name="q"
        placeholder="Search recipes..."
        defaultValue={initialQuery}
        className="w-full px-4 py-2 pr-10 font-mono text-sm bg-white border-2 border-black shadow-brutal focus:outline-none focus:shadow-brutal-sm"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-neutral-600 hover:text-black"
      >
        <SearchIcon className="w-4 h-4" />
      </button>
    </form>
  )
}

// Filter controls
function RecipeFilters({ 
  selectedCategory, 
  selectedStatus 
}: { 
  selectedCategory?: string
  selectedStatus?: string 
}) {
  const categories = [
    'All Categories',
    'Appetizers',
    'Main Courses',
    'Desserts',
    'Salads',
    'Soups',
    'Beverages',
    'Snacks',
    'Pasta',
  ]

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
  ]

  return (
    <div className="flex items-center gap-3">
      <select
        name="category"
        defaultValue={selectedCategory}
        className="px-3 py-2 font-mono text-sm bg-white border-2 border-black shadow-brutal focus:outline-none focus:shadow-brutal-sm"
      >
        {categories.map((category) => (
          <option key={category} value={category === 'All Categories' ? '' : category}>
            {category}
          </option>
        ))}
      </select>

      <select
        name="status"
        defaultValue={selectedStatus}
        className="px-3 py-2 font-mono text-sm bg-white border-2 border-black shadow-brutal focus:outline-none focus:shadow-brutal-sm"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      <Button type="submit" variant="outline" className="font-mono text-sm">
        <FilterIcon className="w-4 h-4 mr-2" />
        Filter
      </Button>
    </div>
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
    </svg>
  )
}
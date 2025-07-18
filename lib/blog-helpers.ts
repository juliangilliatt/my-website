import { formatDate } from '@/lib/mdx'

// Blog post utilities
export function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).filter(word => word.length > 0).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return Math.max(1, minutes)
}

export function getWordCount(content: string): number {
  return content.split(/\s+/).filter(word => word.length > 0).length
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '< 1 min read'
  if (minutes === 1) return '1 min read'
  return `${minutes} min read`
}

// Content formatting
export function truncateContent(content: string, maxLength: number = 160): string {
  if (content.length <= maxLength) return content
  
  const truncated = content.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }
  
  return truncated + '...'
}

export function stripMarkdown(content: string): string {
  return content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

export function extractExcerpt(content: string, maxLength: number = 160): string {
  const plainText = stripMarkdown(content)
  return truncateContent(plainText, maxLength)
}

// Date utilities
export function formatPublishedDate(date: string): string {
  return formatDate(date)
}

export function formatUpdatedDate(date: string): string {
  return `Updated ${formatDate(date)}`
}

export function getRelativeDate(date: string): string {
  const now = new Date()
  const publishedDate = new Date(date)
  const diffInMs = now.getTime() - publishedDate.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

export function isRecent(date: string, daysThreshold: number = 7): boolean {
  const now = new Date()
  const publishedDate = new Date(date)
  const diffInMs = now.getTime() - publishedDate.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  return diffInDays <= daysThreshold
}

// Tag utilities
export function formatTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-')
}

export function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim()
}

export function getTagColor(tag: string): string {
  const colors = [
    'bg-red-100 text-red-800 border-red-300',
    'bg-blue-100 text-blue-800 border-blue-300',
    'bg-green-100 text-green-800 border-green-300',
    'bg-yellow-100 text-yellow-800 border-yellow-300',
    'bg-purple-100 text-purple-800 border-purple-300',
    'bg-pink-100 text-pink-800 border-pink-300',
    'bg-indigo-100 text-indigo-800 border-indigo-300',
    'bg-gray-100 text-gray-800 border-gray-300',
  ]
  
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// Category utilities
export function formatCategory(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-')
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'technology': '💻',
    'programming': '⚡',
    'design': '🎨',
    'tutorial': '📚',
    'tips': '💡',
    'news': '📰',
    'review': '⭐',
    'personal': '👤',
    'travel': '✈️',
    'food': '🍽️',
    'lifestyle': '🌟',
    'business': '💼',
    'productivity': '⚡',
    'tools': '🔧',
    'ai': '🤖',
    'web': '🌐',
    'mobile': '📱',
    'database': '🗄️',
    'security': '🔒',
    'performance': '🚀',
  }
  
  return icons[category.toLowerCase()] || '📝'
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'technology': 'bg-blue-100 text-blue-800 border-blue-300',
    'programming': 'bg-green-100 text-green-800 border-green-300',
    'design': 'bg-purple-100 text-purple-800 border-purple-300',
    'tutorial': 'bg-orange-100 text-orange-800 border-orange-300',
    'tips': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'news': 'bg-red-100 text-red-800 border-red-300',
    'review': 'bg-pink-100 text-pink-800 border-pink-300',
    'personal': 'bg-gray-100 text-gray-800 border-gray-300',
    'travel': 'bg-cyan-100 text-cyan-800 border-cyan-300',
    'food': 'bg-amber-100 text-amber-800 border-amber-300',
    'lifestyle': 'bg-rose-100 text-rose-800 border-rose-300',
    'business': 'bg-slate-100 text-slate-800 border-slate-300',
    'productivity': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'tools': 'bg-violet-100 text-violet-800 border-violet-300',
    'ai': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'web': 'bg-sky-100 text-sky-800 border-sky-300',
    'mobile': 'bg-lime-100 text-lime-800 border-lime-300',
    'database': 'bg-teal-100 text-teal-800 border-teal-300',
    'security': 'bg-red-100 text-red-800 border-red-300',
    'performance': 'bg-green-100 text-green-800 border-green-300',
  }
  
  return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300'
}

// Search utilities
export function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!searchTerm) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>')
}

export function getSearchSuggestions(query: string, allPosts: any[]): string[] {
  if (!query || query.length < 2) return []
  
  const suggestions = new Set<string>()
  
  // Add matching tags
  allPosts.forEach(post => {
    post.tags?.forEach((tag: string) => {
      if (tag.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(tag)
      }
    })
  })
  
  // Add matching categories
  allPosts.forEach(post => {
    if (post.category && post.category.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(post.category)
    }
  })
  
  // Add matching titles (first few words)
  allPosts.forEach(post => {
    const titleWords = post.title.split(' ').slice(0, 3).join(' ')
    if (titleWords.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(titleWords)
    }
  })
  
  return Array.from(suggestions).slice(0, 5)
}

// SEO utilities
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  const plainText = stripMarkdown(content)
  return truncateContent(plainText, maxLength)
}

export function generateKeywords(post: any): string[] {
  const keywords = new Set<string>()
  
  // Add category
  if (post.category) {
    keywords.add(post.category.toLowerCase())
  }
  
  // Add tags
  post.tags?.forEach((tag: string) => {
    keywords.add(tag.toLowerCase())
  })
  
  // Add common keywords
  keywords.add('blog')
  keywords.add('article')
  keywords.add('post')
  
  return Array.from(keywords)
}

export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// URL utilities
export function getBlogUrl(slug: string): string {
  return `/blog/${slug}`
}

export function getTagUrl(tag: string): string {
  return `/blog?tag=${encodeURIComponent(tag)}`
}

export function getCategoryUrl(category: string): string {
  return `/blog?category=${encodeURIComponent(category)}`
}

export function getSearchUrl(query: string): string {
  return `/blog?q=${encodeURIComponent(query)}`
}

export function getEditUrl(slug: string): string {
  return `/admin/blog/${slug}/edit`
}

// Sorting utilities
export function sortPostsByDate(posts: any[], order: 'asc' | 'desc' = 'desc'): any[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime()
    const dateB = new Date(b.publishedAt).getTime()
    
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

export function sortPostsByPopularity(posts: any[]): any[] {
  return [...posts].sort((a, b) => {
    const scoreA = (a.featured ? 100 : 0) + (a.viewCount || 0)
    const scoreB = (b.featured ? 100 : 0) + (b.viewCount || 0)
    
    return scoreB - scoreA
  })
}

export function sortPostsByReadingTime(posts: any[], order: 'asc' | 'desc' = 'asc'): any[] {
  return [...posts].sort((a, b) => {
    const timeA = a.readingTime || 0
    const timeB = b.readingTime || 0
    
    return order === 'desc' ? timeB - timeA : timeA - timeB
  })
}

// Filter utilities
export function filterPostsByTag(posts: any[], tag: string): any[] {
  return posts.filter(post => 
    post.tags?.some((postTag: string) => 
      postTag.toLowerCase() === tag.toLowerCase()
    )
  )
}

export function filterPostsByCategory(posts: any[], category: string): any[] {
  return posts.filter(post => 
    post.category?.toLowerCase() === category.toLowerCase()
  )
}

export function filterPostsByQuery(posts: any[], query: string): any[] {
  const searchTerm = query.toLowerCase()
  
  return posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.description.toLowerCase().includes(searchTerm) ||
    post.content.toLowerCase().includes(searchTerm) ||
    post.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm)) ||
    post.category?.toLowerCase().includes(searchTerm)
  )
}

export function filterPostsByDateRange(posts: any[], startDate: string, endDate: string): any[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return posts.filter(post => {
    const postDate = new Date(post.publishedAt)
    return postDate >= start && postDate <= end
  })
}

// Statistics utilities
export function getPostStats(posts: any[]) {
  const totalPosts = posts.length
  const totalWords = posts.reduce((sum, post) => sum + getWordCount(post.content), 0)
  const totalReadingTime = posts.reduce((sum, post) => sum + (post.readingTime || 0), 0)
  
  const categories = new Set(posts.map(post => post.category).filter(Boolean))
  const tags = new Set(posts.flatMap(post => post.tags || []))
  
  const averageReadingTime = totalPosts > 0 ? Math.round(totalReadingTime / totalPosts) : 0
  const averageWordCount = totalPosts > 0 ? Math.round(totalWords / totalPosts) : 0
  
  return {
    totalPosts,
    totalWords,
    totalReadingTime,
    uniqueCategories: categories.size,
    uniqueTags: tags.size,
    averageReadingTime,
    averageWordCount,
  }
}

export function getPopularTags(posts: any[], limit: number = 10): Array<{ tag: string; count: number }> {
  const tagCounts = new Map<string, number>()
  
  posts.forEach(post => {
    post.tags?.forEach((tag: string) => {
      const normalizedTag = normalizeTag(tag)
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1)
    })
  })
  
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function getPopularCategories(posts: any[]): Array<{ category: string; count: number }> {
  const categoryCounts = new Map<string, number>()
  
  posts.forEach(post => {
    if (post.category) {
      const normalizedCategory = post.category.toLowerCase()
      categoryCounts.set(normalizedCategory, (categoryCounts.get(normalizedCategory) || 0) + 1)
    }
  })
  
  return Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

// Content validation
export function validatePost(post: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!post.title || post.title.trim().length === 0) {
    errors.push('Title is required')
  }
  
  if (!post.description || post.description.trim().length === 0) {
    errors.push('Description is required')
  }
  
  if (!post.content || post.content.trim().length === 0) {
    errors.push('Content is required')
  }
  
  if (!post.publishedAt) {
    errors.push('Published date is required')
  } else {
    const publishedDate = new Date(post.publishedAt)
    if (isNaN(publishedDate.getTime())) {
      errors.push('Invalid published date')
    }
  }
  
  if (!post.slug || post.slug.trim().length === 0) {
    errors.push('Slug is required')
  }
  
  if (post.slug && !/^[a-z0-9-]+$/.test(post.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Analytics utilities
export function trackPostView(slug: string): void {
  // Implementation would depend on analytics service
  console.log(`Post view tracked: ${slug}`)
}

export function trackPostShare(slug: string, platform: string): void {
  // Implementation would depend on analytics service
  console.log(`Post share tracked: ${slug} on ${platform}`)
}

export function trackSearch(query: string): void {
  // Implementation would depend on analytics service
  console.log(`Search tracked: ${query}`)
}
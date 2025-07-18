interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  author: {
    login: string
    avatar_url: string
  } | null
  committer: {
    login: string
    avatar_url: string
  } | null
  html_url: string
}

interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  clone_url: string
  ssh_url: string
  language: string
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  default_branch: string
}

interface GitHubUser {
  login: string
  id: number
  name: string
  email: string
  bio: string
  avatar_url: string
  html_url: string
  blog: string
  location: string
  company: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

interface GitHubApiResponse<T> {
  data: T | null
  error: string | null
  ratelimit: {
    limit: number
    remaining: number
    reset: number
  } | null
}

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'your-username'
const GITHUB_REPO = process.env.GITHUB_REPO || 'my-website'

// Cache for GitHub API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

function getCacheKey(endpoint: string, params?: Record<string, any>): string {
  const paramString = params ? new URLSearchParams(params).toString() : ''
  return `${endpoint}${paramString ? `?${paramString}` : ''}`
}

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null
  
  const now = Date.now()
  if (now > cached.timestamp + cached.ttl) {
    cache.delete(key)
    return null
  }
  
  return cached.data
}

function setCachedData<T>(key: string, data: T, ttlMinutes: number = 60): void {
  const ttl = ttlMinutes * 60 * 1000 // Convert to milliseconds
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  })
}

async function makeGitHubRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  cacheTtlMinutes: number = 60
): Promise<GitHubApiResponse<T>> {
  const cacheKey = getCacheKey(endpoint, options.method === 'GET' ? {} : undefined)
  
  // Check cache first
  const cachedData = getCachedData<T>(cacheKey)
  if (cachedData) {
    return {
      data: cachedData,
      error: null,
      ratelimit: null,
    }
  }

  const url = `${GITHUB_API_BASE}${endpoint}`
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'my-website',
    ...(options.headers || {}),
  }

  // Add auth token if available
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Extract rate limit info
    const ratelimit = {
      limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
      remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
      reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || `GitHub API error: ${response.status} ${response.statusText}`
      
      return {
        data: null,
        error: errorMessage,
        ratelimit,
      }
    }

    const data = await response.json()
    
    // Cache successful responses
    setCachedData(cacheKey, data, cacheTtlMinutes)
    
    return {
      data,
      error: null,
      ratelimit,
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      ratelimit: null,
    }
  }
}

export async function getLastCommit(
  owner: string = GITHUB_USERNAME,
  repo: string = GITHUB_REPO,
  branch: string = 'main'
): Promise<GitHubApiResponse<GitHubCommit>> {
  const endpoint = `/repos/${owner}/${repo}/commits/${branch}`
  return makeGitHubRequest<GitHubCommit>(endpoint, {}, 60) // Cache for 1 hour
}

export async function getRepositoryCommits(
  owner: string = GITHUB_USERNAME,
  repo: string = GITHUB_REPO,
  options: {
    sha?: string
    path?: string
    author?: string
    since?: string
    until?: string
    per_page?: number
    page?: number
  } = {}
): Promise<GitHubApiResponse<GitHubCommit[]>> {
  const endpoint = `/repos/${owner}/${repo}/commits`
  const params = new URLSearchParams()
  
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })
  
  const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint
  return makeGitHubRequest<GitHubCommit[]>(url, {}, 30) // Cache for 30 minutes
}

export async function getRepository(
  owner: string = GITHUB_USERNAME,
  repo: string = GITHUB_REPO
): Promise<GitHubApiResponse<GitHubRepository>> {
  const endpoint = `/repos/${owner}/${repo}`
  return makeGitHubRequest<GitHubRepository>(endpoint, {}, 120) // Cache for 2 hours
}

export async function getUserProfile(
  username: string = GITHUB_USERNAME
): Promise<GitHubApiResponse<GitHubUser>> {
  const endpoint = `/users/${username}`
  return makeGitHubRequest<GitHubUser>(endpoint, {}, 240) // Cache for 4 hours
}

export async function getUserRepositories(
  username: string = GITHUB_USERNAME,
  options: {
    type?: 'all' | 'owner' | 'public' | 'private' | 'member'
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  } = {}
): Promise<GitHubApiResponse<GitHubRepository[]>> {
  const endpoint = `/users/${username}/repos`
  const params = new URLSearchParams()
  
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  })
  
  const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint
  return makeGitHubRequest<GitHubRepository[]>(url, {}, 60) // Cache for 1 hour
}

// Helper functions for formatting and display
export function formatCommitDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}

export function formatCommitMessage(message: string, maxLength: number = 72): string {
  const lines = message.split('\n')
  const firstLine = lines[0]
  
  if (firstLine.length <= maxLength) {
    return firstLine
  }
  
  return firstLine.substring(0, maxLength - 3) + '...'
}

export function getCommitUrl(
  owner: string = GITHUB_USERNAME,
  repo: string = GITHUB_REPO,
  sha: string
): string {
  return `https://github.com/${owner}/${repo}/commit/${sha}`
}

export function getRepositoryUrl(
  owner: string = GITHUB_USERNAME,
  repo: string = GITHUB_REPO
): string {
  return `https://github.com/${owner}/${repo}`
}

export function isRateLimited(response: GitHubApiResponse<any>): boolean {
  return response.ratelimit?.remaining === 0
}

export function getRateLimitResetTime(response: GitHubApiResponse<any>): Date | null {
  if (!response.ratelimit?.reset) return null
  return new Date(response.ratelimit.reset * 1000)
}

// Cache management functions
export function clearGitHubCache(): void {
  cache.clear()
}

export function getCacheStats(): {
  entries: number
  keys: string[]
  totalSize: number
} {
  return {
    entries: cache.size,
    keys: Array.from(cache.keys()),
    totalSize: JSON.stringify(Array.from(cache.entries())).length,
  }
}

// Development helpers
export function isGitHubConfigured(): boolean {
  return !!(GITHUB_TOKEN && GITHUB_USERNAME && GITHUB_REPO)
}

export function getGitHubConfig(): {
  hasToken: boolean
  username: string
  repo: string
  baseUrl: string
} {
  return {
    hasToken: !!GITHUB_TOKEN,
    username: GITHUB_USERNAME,
    repo: GITHUB_REPO,
    baseUrl: GITHUB_API_BASE,
  }
}
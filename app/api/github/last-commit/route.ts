import { NextRequest, NextResponse } from 'next/server'
import { getLastCommit, formatCommitDate, formatCommitMessage, getCommitUrl, isRateLimited, getRateLimitResetTime } from '@/lib/github'

// Cache headers for 1 hour
const CACHE_DURATION = 60 * 60 // 1 hour in seconds

interface LastCommitResponse {
  sha: string
  message: string
  author: {
    name: string
    login: string | null
    avatar_url: string | null
  }
  date: string
  formattedDate: string
  url: string
  error?: string
  ratelimit?: {
    limit: number
    remaining: number
    reset: number
    resetTime: string
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner') || process.env.GITHUB_USERNAME || 'your-username'
    const repo = searchParams.get('repo') || process.env.GITHUB_REPO || 'my-website'
    const branch = searchParams.get('branch') || 'main'

    // Get last commit from GitHub API
    const response = await getLastCommit(owner, repo, branch)

    if (response.error) {
      return NextResponse.json(
        {
          error: response.error,
          ratelimit: response.ratelimit ? {
            limit: response.ratelimit.limit,
            remaining: response.ratelimit.remaining,
            reset: response.ratelimit.reset,
            resetTime: getRateLimitResetTime(response)?.toISOString() || '',
          } : undefined,
        },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'public, max-age=300', // Cache errors for 5 minutes
          },
        }
      )
    }

    if (!response.data) {
      return NextResponse.json(
        { error: 'No commit data available' },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'public, max-age=300', // Cache 404s for 5 minutes
          },
        }
      )
    }

    const commit = response.data
    
    // Format response data
    const lastCommitData: LastCommitResponse = {
      sha: commit.sha,
      message: formatCommitMessage(commit.commit.message),
      author: {
        name: commit.commit.author.name,
        login: commit.author?.login || null,
        avatar_url: commit.author?.avatar_url || null,
      },
      date: commit.commit.author.date,
      formattedDate: formatCommitDate(commit.commit.author.date),
      url: getCommitUrl(owner, repo, commit.sha),
    }

    // Add rate limit info if available
    if (response.ratelimit) {
      lastCommitData.ratelimit = {
        limit: response.ratelimit.limit,
        remaining: response.ratelimit.remaining,
        reset: response.ratelimit.reset,
        resetTime: getRateLimitResetTime(response)?.toISOString() || '',
      }
    }

    // Set cache headers
    const cacheControl = isRateLimited(response) 
      ? 'public, max-age=300' // Cache for 5 minutes if rate limited
      : `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}`

    return NextResponse.json(lastCommitData, {
      status: 200,
      headers: {
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
    
  } catch (error) {
    console.error('GitHub API route error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'public, max-age=60', // Cache errors for 1 minute
        },
      }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Health check endpoint
export async function HEAD(): Promise<NextResponse> {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  })
}
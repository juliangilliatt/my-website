'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TestAuthFlowPage() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const log = (message: string) => {
      const timestamp = new Date().toISOString()
      setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    }

    log(`Page loaded`)
    log(`Auth loaded: ${isLoaded}`)
    log(`Signed in: ${isSignedIn}`)
    log(`User ID: ${userId}`)
    
    // Check URL params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      log(`URL params: ${params.toString()}`)
      
      const redirectUrl = params.get('redirect_url')
      if (redirectUrl) {
        log(`Found redirect_url: ${redirectUrl}`)
      }
    }
  }, [isLoaded, isSignedIn, userId])

  const handleAdminClick = () => {
    const log = (message: string) => {
      const timestamp = new Date().toISOString()
      setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    }
    
    log('Navigating to /admin')
    router.push('/admin')
  }

  const handleSignOut = async () => {
    const log = (message: string) => {
      const timestamp = new Date().toISOString()
      setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    }
    
    log('Signing out...')
    // Note: Sign out is handled by the UserButton component
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Flow Test</h1>
      
      <div className="bg-gray-50 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Current Auth State:</h2>
        <div className="space-y-1 font-mono text-sm">
          <div>Loaded: {String(isLoaded)}</div>
          <div>Signed In: {String(isSignedIn)}</div>
          <div>User ID: {userId || 'null'}</div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={handleAdminClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Navigate to /admin
        </button>
        
        <div>
          <a 
            href="/admin" 
            className="text-blue-600 hover:underline"
          >
            Direct link to /admin (using href)
          </a>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Event Log:</h2>
        <div className="space-y-1 font-mono text-xs">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
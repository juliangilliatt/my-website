import { auth } from '@clerk/nextjs/server'

export default async function DebugClerkPage() {
  try {
    const session = await auth()
    
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Clerk Debug Info</h1>
        
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold">Environment Variables:</h2>
            <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not Set'}</p>
            <p>CLERK_SECRET_KEY: {process.env.CLERK_SECRET_KEY ? 'Set' : 'Not Set'}</p>
            <p>ENABLE_CLERK: {process.env.ENABLE_CLERK}</p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold">Auth Session:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold">Test Links:</h2>
            <div className="space-y-2">
              <a href="/sign-in" className="block text-blue-600 hover:underline">→ Go to Sign In</a>
              <a href="/admin" className="block text-blue-600 hover:underline">→ Go to Admin</a>
              <a href="/" className="block text-blue-600 hover:underline">→ Go to Home</a>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Clerk Error</h1>
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-700">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }
}
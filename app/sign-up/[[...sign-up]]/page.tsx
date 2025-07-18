import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Sign up page (disabled for deployment)',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="font-mono text-3xl font-bold text-black uppercase tracking-wide">
            Authentication Disabled
          </h1>
          <p className="mt-2 text-sm text-neutral-600 font-mono">
            Authentication is disabled for deployment demo
          </p>
        </div>

        <div className="bg-white border-2 border-black shadow-brutal p-8">
          <div className="text-center space-y-4">
            <p className="text-sm font-mono text-neutral-600">
              This is a deployment preview. Authentication features are temporarily disabled.
            </p>
            <a 
              href="/" 
              className="inline-block bg-primary-500 hover:bg-primary-600 border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono text-sm uppercase tracking-wide transition-all duration-150 px-4 py-2 text-white"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
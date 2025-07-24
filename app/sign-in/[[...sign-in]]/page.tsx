import { SignIn } from '@clerk/nextjs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
}

// Feature flag for Clerk authentication
const ENABLE_CLERK = process.env.ENABLE_CLERK === 'true'

export default function SignInPage() {
  // If Clerk is disabled, show the disabled message
  if (!ENABLE_CLERK) {
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

  // Render the actual Clerk SignIn component
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-mono text-3xl font-bold text-black uppercase tracking-wide">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-neutral-600 font-mono">
            Welcome back! Please sign in to your account.
          </p>
        </div>
        
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full max-w-md",
                card: "border-2 border-black shadow-brutal bg-white",
                headerTitle: "font-mono text-black",
                headerSubtitle: "font-mono text-neutral-600 text-sm",
                socialButtonsBlockButton: "border-2 border-black hover:shadow-brutal-sm font-mono",
                formButtonPrimary: "bg-black hover:bg-neutral-800 border-2 border-black shadow-brutal hover:shadow-brutal-sm font-mono uppercase tracking-wide",
                formFieldInput: "border-2 border-black focus:ring-0 focus:border-black font-mono",
                footerActionLink: "text-black hover:text-neutral-600 font-mono",
              }
            }}
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  )
}
import { SignIn } from '@clerk/nextjs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
}

export default function SignInPage() {
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
            routing="hash"
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
          />
        </div>
      </div>
    </div>
  )
}
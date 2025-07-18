import { SignIn } from '@clerk/nextjs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account to access admin features',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="font-mono text-3xl font-bold text-black uppercase tracking-wide">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-neutral-600 font-mono">
            Access your admin dashboard
          </p>
        </div>

        <div className="bg-white border-2 border-black shadow-brutal p-8">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-white border-2 border-black shadow-brutal',
                headerTitle: 'font-mono text-xl font-bold text-black uppercase tracking-wide',
                headerSubtitle: 'font-mono text-sm text-neutral-600',
                socialButtonsBlockButton: 'bg-white border-2 border-black shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono text-sm uppercase tracking-wide transition-all duration-150',
                socialButtonsBlockButtonText: 'text-black font-medium',
                dividerLine: 'bg-black',
                dividerText: 'text-black font-mono uppercase text-xs tracking-wide',
                formFieldInput: 'bg-white border-2 border-black shadow-brutal-sm focus:shadow-brutal focus:border-primary-500 font-mono text-sm transition-all duration-150',
                formFieldLabel: 'text-black font-mono text-sm font-medium uppercase tracking-wide',
                formButtonPrimary: 'bg-primary-500 hover:bg-primary-600 border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono text-sm uppercase tracking-wide transition-all duration-150',
                formFieldHintText: 'text-neutral-600 font-mono text-xs',
                identityPreviewText: 'text-black font-mono text-sm',
                identityPreviewEditButton: 'text-primary-500 hover:text-primary-600 font-mono text-sm underline',
                footerActionText: 'text-neutral-600 font-mono text-sm',
                footerActionLink: 'text-primary-500 hover:text-primary-600 font-mono text-sm underline font-medium',
                otpCodeFieldInput: 'bg-white border-2 border-black shadow-brutal-sm focus:shadow-brutal focus:border-primary-500 font-mono text-center transition-all duration-150',
                alertText: 'text-red-600 font-mono text-sm',
                formResendCodeLink: 'text-primary-500 hover:text-primary-600 font-mono text-sm underline',
                navbar: 'border-b-2 border-black',
                navbarButton: 'text-black hover:text-primary-500 font-mono text-sm uppercase tracking-wide',
                badge: 'bg-accent-500 text-white border-2 border-black shadow-brutal-sm font-mono text-xs uppercase tracking-wide',
              },
              layout: {
                socialButtonsPlacement: 'bottom',
                socialButtonsVariant: 'blockButton',
                logoImageUrl: undefined,
                showOptionalFields: false,
              },
              variables: {
                colorPrimary: '#ef4444',
                colorTextOnPrimaryBackground: '#ffffff',
                colorBackground: '#ffffff',
                colorInputBackground: '#ffffff',
                colorInputText: '#000000',
                colorText: '#000000',
                colorTextSecondary: '#737373',
                colorSuccess: '#22c55e',
                colorDanger: '#ef4444',
                colorWarning: '#f59e0b',
                colorNeutral: '#737373',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '0.875rem',
                borderRadius: '0rem',
              },
            }}
            routing="path"
            path="/sign-in"
            redirectUrl="/admin"
            signUpUrl="/sign-up"
          />
        </div>

        <div className="text-center">
          <p className="text-xs text-neutral-500 font-mono">
            Admin access only. Contact administrator for account setup.
          </p>
        </div>
      </div>
    </div>
  )
}
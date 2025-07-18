import { SignUp } from '@clerk/nextjs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create an admin account (invitation only)',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="font-mono text-3xl font-bold text-black uppercase tracking-wide">
            Sign Up
          </h1>
          <p className="mt-2 text-sm text-neutral-600 font-mono">
            Create your admin account
          </p>
          <div className="mt-4 p-4 bg-accent-50 border-2 border-accent-500 shadow-brutal-sm">
            <p className="text-xs text-accent-800 font-mono">
              ⚠️ Admin registration is invitation-only. Contact the site administrator for access.
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-black shadow-brutal p-8">
          <SignUp
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
                phoneInputBox: 'bg-white border-2 border-black shadow-brutal-sm focus:shadow-brutal focus:border-primary-500 font-mono text-sm transition-all duration-150',
                formFieldSuccessText: 'text-green-600 font-mono text-sm',
                formFieldErrorText: 'text-red-600 font-mono text-sm',
                formFieldWarningText: 'text-yellow-600 font-mono text-sm',
                formFieldAction: 'text-primary-500 hover:text-primary-600 font-mono text-sm underline',
                formFieldInputShowPasswordButton: 'text-neutral-600 hover:text-black font-mono text-sm',
                formFieldInputShowPasswordIcon: 'text-neutral-600 hover:text-black',
                formFieldInputShowPasswordIconButton: 'text-neutral-600 hover:text-black',
                formFieldRow: 'space-y-2',
                formFieldControlRow: 'space-y-1',
                formFieldRadioGroup: 'space-y-2',
                formFieldRadioGroupItem: 'flex items-center space-x-2',
                formFieldRadioInput: 'border-2 border-black shadow-brutal-sm focus:shadow-brutal focus:border-primary-500',
                formFieldRadioLabel: 'text-black font-mono text-sm',
                formFieldCheckbox: 'border-2 border-black shadow-brutal-sm focus:shadow-brutal focus:border-primary-500',
                formFieldCheckboxLabel: 'text-black font-mono text-sm',
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
            path="/sign-up"
            redirectUrl="/admin"
            signInUrl="/sign-in"
          />
        </div>

        <div className="text-center">
          <p className="text-xs text-neutral-500 font-mono">
            By signing up, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}
'use client'

import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t-2 border-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="block">
              <h3 className="text-xl font-mono font-bold text-black uppercase tracking-wide">
                My Website
              </h3>
              <p className="text-sm font-mono text-neutral-600 mt-1">
                Recipes & Blog
              </p>
            </Link>
            <p className="text-sm font-mono text-neutral-600">
              A brutalist portfolio website featuring recipes and blog posts about development and cooking.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-sm font-mono font-bold text-black uppercase tracking-wide">
              Navigation
            </h4>
            <nav className="space-y-2">
              <Link
                href="/"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Home
              </Link>
              <Link
                href="/recipes"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Recipes
              </Link>
              <Link
                href="/blog"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Blog
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-sm font-mono font-bold text-black uppercase tracking-wide">
              Categories
            </h4>
            <nav className="space-y-2">
              <Link
                href="/recipes?category=main-course"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Main Course
              </Link>
              <Link
                href="/recipes?category=desserts"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Desserts
              </Link>
              <Link
                href="/blog?category=development"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Development
              </Link>
              <Link
                href="/blog?category=cooking"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Cooking Tips
              </Link>
            </nav>
          </div>

          {/* Social & Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-mono font-bold text-black uppercase tracking-wide">
              Connect
            </h4>
            <nav className="space-y-2">
              {SITE_CONFIG.social.twitter && (
                <a
                  href={`https://twitter.com/${SITE_CONFIG.social.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
                >
                  Twitter
                </a>
              )}
              {SITE_CONFIG.social.github && (
                <a
                  href={`https://github.com/${SITE_CONFIG.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
                >
                  GitHub
                </a>
              )}
              {SITE_CONFIG.social.email && (
                <a
                  href={`mailto:${SITE_CONFIG.social.email}`}
                  className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
                >
                  Email
                </a>
              )}
            </nav>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t-2 border-black">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm font-mono text-neutral-600">
              © {currentYear} {SITE_CONFIG.name}. Built with Next.js and Tailwind CSS.
            </p>
            
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy"
                className="text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Terms
              </Link>
              <Link
                href="/sitemap.xml"
                className="text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Minimal footer for auth pages
export function MinimalFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t-2 border-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm font-mono text-neutral-600">
            © {currentYear} {SITE_CONFIG.name}
          </p>
        </div>
      </div>
    </footer>
  )
}

// Compact footer for admin pages
export function CompactFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-50 border-t-2 border-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-xs font-mono text-neutral-600">
            © {currentYear} {SITE_CONFIG.name}
          </p>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="text-xs font-mono text-neutral-600 hover:text-black transition-colors duration-150"
            >
              Admin
            </Link>
            <Link
              href="/docs"
              className="text-xs font-mono text-neutral-600 hover:text-black transition-colors duration-150"
            >
              Docs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Newsletter signup footer
export function NewsletterFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t-2 border-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Newsletter signup */}
        <div className="mb-8 p-6 bg-neutral-50 border-2 border-black shadow-brutal">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-mono font-bold text-black uppercase tracking-wide mb-2">
              Stay Updated
            </h3>
            <p className="text-sm font-mono text-neutral-600 mb-4">
              Get notified about new recipes and blog posts
            </p>
            
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 text-sm font-mono bg-white border-2 border-black shadow-brutal-sm focus:shadow-brutal focus:border-primary-500 transition-all duration-150"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 font-mono text-sm uppercase tracking-wide transition-all duration-150"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Regular footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link href="/" className="block">
              <h3 className="text-xl font-mono font-bold text-black uppercase tracking-wide">
                My Website
              </h3>
            </Link>
            <p className="text-sm font-mono text-neutral-600">
              Recipes, blog posts, and development tips.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-mono font-bold text-black uppercase tracking-wide">
              Quick Links
            </h4>
            <nav className="space-y-2">
              <Link
                href="/recipes"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Recipes
              </Link>
              <Link
                href="/blog"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Blog
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-mono font-bold text-black uppercase tracking-wide">
              Legal
            </h4>
            <nav className="space-y-2">
              <Link
                href="/privacy"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-sm font-mono text-neutral-600 hover:text-black transition-colors duration-150"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-black text-center">
          <p className="text-sm font-mono text-neutral-600">
            © {currentYear} {SITE_CONFIG.name}. Built with Next.js.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Sticky footer for mobile
export function StickyFooter() {
  return (
    <footer className="sticky bottom-0 bg-white border-t-2 border-black z-20 md:hidden">
      <div className="px-4 py-2">
        <p className="text-xs font-mono text-neutral-600 text-center">
          © {new Date().getFullYear()} {SITE_CONFIG.name}
        </p>
      </div>
    </footer>
  )
}

// Social media footer
export function SocialFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t-2 border-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-xl font-mono font-bold text-black uppercase tracking-wide">
              {SITE_CONFIG.name}
            </h3>
            <p className="text-sm font-mono text-neutral-600 mt-1">
              Follow for updates and new content
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            {SITE_CONFIG.social.twitter && (
              <a
                href={`https://twitter.com/${SITE_CONFIG.social.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all duration-150"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            )}
            
            {SITE_CONFIG.social.github && (
              <a
                href={`https://github.com/${SITE_CONFIG.social.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all duration-150"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            )}
          </div>

          <div className="pt-6 border-t-2 border-black">
            <p className="text-sm font-mono text-neutral-600">
              © {currentYear} {SITE_CONFIG.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
import { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} - ${SITE_CONFIG.description}`,
  description: SITE_CONFIG.description,
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="px-4 py-2 bg-black text-white border-2 border-black font-mono font-medium hover:bg-neutral-800 transition-colors"
            >
              Home
            </a>
            <a
              href="/recipes"
              className="px-4 py-2 bg-white text-black border-2 border-black shadow-brutal hover:shadow-brutal-sm font-mono font-medium transition-all"
            >
              Recipes
            </a>
          </div>
          <a
            href="/admin"
            className="font-mono text-sm text-neutral-600 hover:text-black underline transition-colors"
          >
            Admin
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {/* Name */}
          <h1 className="text-4xl font-mono font-bold text-black">
            {SITE_CONFIG.name}
          </h1>

          {/* Links Row */}
          <div className="flex items-center gap-6 flex-wrap">
            <a
              href="mailto:jeg402@gmail.com"
              className="font-mono text-sm text-neutral-600 hover:text-black transition-colors"
            >
              jeg402@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/julian-gilliatt/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-neutral-600 hover:text-black transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={`https://github.com/${SITE_CONFIG.social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-neutral-600 hover:text-black transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* About Me */}
          <p className="text-lg font-mono text-neutral-600 max-w-2xl">
            {SITE_CONFIG.description}
          </p>
        </div>
      </main>
    </div>
  )
}
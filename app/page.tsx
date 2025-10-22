import { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} - ${SITE_CONFIG.description}`,
  description: SITE_CONFIG.description,
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-mono font-bold text-black uppercase tracking-wide">
            {SITE_CONFIG.name}
          </h1>
          <p className="text-lg font-mono text-neutral-600">
            {SITE_CONFIG.description}
          </p>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <a 
              href="/recipes" 
              className="px-6 py-3 bg-primary-500 text-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono font-semibold uppercase tracking-wide transition-all duration-150"
            >
              View Recipes
            </a>
            <a 
              href="/blog" 
              className="px-6 py-3 bg-white text-black border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono font-medium uppercase tracking-wide transition-all duration-150"
            >
              Read Blog
            </a>
          </div>
          
          <div className="space-y-4">
            <p className="font-mono text-sm text-neutral-500">Connect with me:</p>
            <div className="flex justify-center gap-4">
              <a
                href={`https://github.com/${SITE_CONFIG.social.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-neutral-600 hover:text-black transition-colors"
              >
                GitHub
              </a>
              <a
                href={`mailto:${SITE_CONFIG.social.email}`}
                className="font-mono text-sm text-neutral-600 hover:text-black transition-colors"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
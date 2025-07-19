import { Metadata } from 'next'
import { HeroSection, FeatureHighlights, StatsSection } from '@/components/landing/HeroSection'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} - ${SITE_CONFIG.description}`,
  description: SITE_CONFIG.description,
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.social.twitter,
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />
      
      <main className="md:ml-64">
        {/* Mobile header spacer */}
        <div className="md:hidden h-16" />
        
        {/* Hero Section */}
        <HeroSection 
          variant="full" 
          showProfileImage={true}
          showLastUpdated={true}
          showSocial={true}
        />
        
        {/* Feature Highlights */}
        <FeatureHighlights />
        
        {/* Stats Section */}
        <StatsSection />
        
        {/* Recent Content Preview */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-black uppercase tracking-wide text-center mb-12">
              Latest Updates
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Recipes */}
              <div className="space-y-6">
                <h3 className="text-xl font-mono font-bold text-black uppercase tracking-wide">
                  Recent Recipes
                </h3>
                <div className="space-y-4">
                  <div className="p-6 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
                    <h4 className="text-lg font-mono font-semibold text-black mb-2">
                      Classic Chocolate Chip Cookies
                    </h4>
                    <p className="text-sm font-mono text-neutral-600 mb-4">
                      The perfect crispy-chewy chocolate chip cookie recipe that never fails...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-neutral-500">
                        30 min • Easy
                      </span>
                      <a href="/recipes/chocolate-chip-cookies" className="text-sm font-mono text-primary-500 hover:text-primary-600 transition-colors duration-150">
                        View Recipe →
                      </a>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
                    <h4 className="text-lg font-mono font-semibold text-black mb-2">
                      Quick Pasta Aglio e Olio
                    </h4>
                    <p className="text-sm font-mono text-neutral-600 mb-4">
                      A simple Italian classic with garlic, olive oil, and red pepper flakes...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-neutral-500">
                        15 min • Easy
                      </span>
                      <a href="/recipes/pasta-aglio-e-olio" className="text-sm font-mono text-primary-500 hover:text-primary-600 transition-colors duration-150">
                        View Recipe →
                      </a>
                    </div>
                  </div>
                </div>
                
                <a 
                  href="/recipes" 
                  className="inline-flex items-center px-4 py-2 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono font-medium text-sm uppercase tracking-wide transition-all duration-150"
                >
                  View All Recipes
                </a>
              </div>
              
              {/* Recent Blog Posts */}
              <div className="space-y-6">
                <h3 className="text-xl font-mono font-bold text-black uppercase tracking-wide">
                  Recent Blog Posts
                </h3>
                <div className="space-y-4">
                  <div className="p-6 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
                    <h4 className="text-lg font-mono font-semibold text-black mb-2">
                      Building with Next.js 14
                    </h4>
                    <p className="text-sm font-mono text-neutral-600 mb-4">
                      My experience building this brutalist website with the latest Next.js features...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-neutral-500">
                        Dec 2024 • Development
                      </span>
                      <a href="/blog/building-with-nextjs-14" className="text-sm font-mono text-primary-500 hover:text-primary-600 transition-colors duration-150">
                        Read More →
                      </a>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
                    <h4 className="text-lg font-mono font-semibold text-black mb-2">
                      The Art of Recipe Testing
                    </h4>
                    <p className="text-sm font-mono text-neutral-600 mb-4">
                      Why I test every recipe at least three times before publishing...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-neutral-500">
                        Nov 2024 • Cooking
                      </span>
                      <a href="/blog/recipe-testing" className="text-sm font-mono text-primary-500 hover:text-primary-600 transition-colors duration-150">
                        Read More →
                      </a>
                    </div>
                  </div>
                </div>
                
                <a 
                  href="/blog" 
                  className="inline-flex items-center px-4 py-2 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono font-medium text-sm uppercase tracking-wide transition-all duration-150"
                >
                  View All Posts
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <div className="md:ml-64">
        <Footer />
      </div>
    </div>
  )
}
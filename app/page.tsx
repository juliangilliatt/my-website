import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Julian Gilliatt',
  description: 'Personal website and portfolio',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-4">
            Julian Gilliatt
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Welcome to my website
          </p>
          <div className="space-y-4">
            <div className="p-6 bg-gray-50 border-2 border-black shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p className="text-gray-600">
                This website is under construction. Check back soon for recipes, blog posts, and more!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
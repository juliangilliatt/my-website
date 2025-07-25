export default function TestNoAuthPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page - No Auth Check</h1>
      <p>This page has no authentication check at all.</p>
      <p>If you can see this, the redirect is NOT coming from auth checks.</p>
      
      <div className="mt-4 space-y-2">
        <a href="/admin" className="block text-blue-600 hover:underline">→ Try admin page</a>
        <a href="/debug-clerk" className="block text-blue-600 hover:underline">→ Back to debug page</a>
      </div>
    </div>
  )
}
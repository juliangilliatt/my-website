import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminTestPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page - No Components</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p>If you can see this, authentication is working!</p>
        <p>User ID: {session.user.id}</p>
        <p>User Name: {session.user.name || 'No name'}</p>
        <p>User Email: {session.user.email || 'No email'}</p>
      </div>
      
      <div className="mt-4 space-y-2">
        <a href="/admin" className="block text-blue-600 hover:underline">→ Try regular admin page</a>
        <a href="/admin/recipes" className="block text-blue-600 hover:underline">→ Try recipes admin page</a>
        <a href="/admin/recipes/create" className="block text-blue-600 hover:underline">→ Try create recipe page</a>
      </div>
    </div>
  )
}
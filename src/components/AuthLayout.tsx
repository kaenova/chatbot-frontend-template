import { ReactNode } from 'react'
import { getSessionOrMock } from '@/lib/mock-session'
import { redirect } from 'next/navigation'
import GlobalNavbar from './GlobalNavbar'

interface AuthLayoutProps {
  children: ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await getSessionOrMock()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Global Navbar */}
      <GlobalNavbar user={session.user} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
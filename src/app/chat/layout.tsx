import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import { getSessionOrMock } from "@/lib/mock-session"

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSessionOrMock()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar user={session.user} />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}

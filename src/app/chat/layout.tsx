import AuthLayout from "@/components/AuthLayout"
import { ChatInputProvider } from "@/contexts/ChatInputContext"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout>
      <ChatInputProvider>
        {children}
      </ChatInputProvider>
    </AuthLayout>
  )
}

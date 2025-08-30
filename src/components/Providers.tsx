'use client'

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { ChatProvider } from "@/contexts/ChatContext"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ChatProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ChatProvider>
  )
}

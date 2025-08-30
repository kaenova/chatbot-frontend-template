'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatItem {
  id: string
  title: string
  date: string
}

interface ChatContextType {
  chatHistory: ChatItem[]
  setChatHistory: (history: ChatItem[]) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([
    { id: '1', title: 'How to build a web application', date: '2 hours ago' },
    { id: '2', title: 'React best practices', date: '1 day ago' },
    { id: '3', title: 'TypeScript basics', date: '3 days ago' },
    { id: '4', title: 'Next.js routing', date: '1 week ago' },
    { id: '5', title: 'CSS Grid vs Flexbox', date: '2 weeks ago' },
    { id: '6', title: 'Database design principles', date: '3 weeks ago' },
    { id: '7', title: 'API authentication methods', date: '1 month ago' },
    { id: '8', title: 'Performance optimization techniques', date: '1 month ago' },
    { id: '9', title: 'Testing strategies for React apps', date: '2 months ago' },
    { id: '10', title: 'Deployment best practices', date: '2 months ago' },
    { id: '11', title: 'State management solutions', date: '3 months ago' },
    { id: '12', title: 'Component design patterns', date: '3 months ago' },
    { id: '13', title: 'Error handling in JavaScript', date: '4 months ago' },
    { id: '14', title: 'Web security fundamentals', date: '4 months ago' },
    { id: '15', title: 'Progressive Web Apps', date: '5 months ago' },
  ])

  return (
    <ChatContext.Provider value={{ chatHistory, setChatHistory }}>
      {children}
    </ChatContext.Provider>
  )
}
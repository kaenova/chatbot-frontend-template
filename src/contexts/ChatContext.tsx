'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatItem {
  id: string
  title: string
  date: string
  createdAt: Date
  isPinned: boolean
}

interface ChatContextType {
  chatHistory: ChatItem[]
  setChatHistory: (history: ChatItem[]) => void
  getGroupedChatHistory: () => GroupedChatHistory
  togglePinChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
}

interface GroupedChatHistory {
  pinned: ChatItem[]
  today: ChatItem[]
  yesterday: ChatItem[]
  previous7Days: ChatItem[]
  previous30Days: ChatItem[]
  older: ChatItem[]
}

// Utility function to group chats by date
function groupChatsByDate(chats: ChatItem[]): GroupedChatHistory {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const grouped: GroupedChatHistory = {
    pinned: [],
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
    older: []
  }

  chats.forEach(chat => {
    if (chat.isPinned) {
      grouped.pinned.push(chat)
      return // Skip date-based grouping for pinned chats
    }

    const chatDate = new Date(chat.createdAt.getFullYear(), chat.createdAt.getMonth(), chat.createdAt.getDate())
    
    if (chatDate.getTime() === today.getTime()) {
      grouped.today.push(chat)
    } else if (chatDate.getTime() === yesterday.getTime()) {
      grouped.yesterday.push(chat)
    } else if (chatDate >= sevenDaysAgo) {
      grouped.previous7Days.push(chat)
    } else if (chatDate >= thirtyDaysAgo) {
      grouped.previous30Days.push(chat)
    } else {
      grouped.older.push(chat)
    }
  })

  // Sort each group by creation date (newest first)
  Object.values(grouped).forEach(group => {
    group.sort((a: ChatItem, b: ChatItem) => b.createdAt.getTime() - a.createdAt.getTime())
  })

  return grouped
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
  const now = new Date()
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([
    { 
      id: '1', 
      title: 'How to build a web application', 
      date: '2 hours ago',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      isPinned: true
    },
    { 
      id: '2', 
      title: 'React best practices', 
      date: '1 day ago',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isPinned: false
    },
    { 
      id: '3', 
      title: 'TypeScript basics', 
      date: '3 days ago',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isPinned: true
    },
    { 
      id: '4', 
      title: 'Next.js routing', 
      date: '1 week ago',
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      isPinned: false
    },
    { 
      id: '5', 
      title: 'CSS Grid vs Flexbox', 
      date: '2 weeks ago',
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      isPinned: false
    },
    { 
      id: '6', 
      title: 'Database design principles', 
      date: '3 weeks ago',
      createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
      isPinned: false
    },
    { 
      id: '7', 
      title: 'API authentication methods', 
      date: '1 month ago',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      isPinned: false
    },
    { 
      id: '8', 
      title: 'Performance optimization techniques', 
      date: '1 month ago',
      createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      isPinned: false
    },
    { 
      id: '9', 
      title: 'Testing strategies for React apps', 
      date: '2 months ago',
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
      isPinned: false
    },
    { 
      id: '10', 
      title: 'Deployment best practices', 
      date: '2 months ago',
      createdAt: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000), // 65 days ago
      isPinned: false
    },
    { 
      id: '11', 
      title: 'State management solutions', 
      date: '3 months ago',
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      isPinned: false
    },
    { 
      id: '12', 
      title: 'Component design patterns', 
      date: '3 months ago',
      createdAt: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000), // 95 days ago
      isPinned: false
    },
    { 
      id: '13', 
      title: 'Error handling in JavaScript', 
      date: '4 months ago',
      createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), // 4 months ago
      isPinned: false
    },
    { 
      id: '14', 
      title: 'Web security fundamentals', 
      date: '4 months ago',
      createdAt: new Date(now.getTime() - 125 * 24 * 60 * 60 * 1000), // 125 days ago
      isPinned: false
    },
    { 
      id: '15', 
      title: 'Progressive Web Apps', 
      date: '5 months ago',
      createdAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000), // 5 months ago
      isPinned: false
    },
  ])

  const togglePinChat = (chatId: string) => {
    setChatHistory(prevHistory => 
      prevHistory.map(chat => 
        chat.id === chatId 
          ? { ...chat, isPinned: !chat.isPinned }
          : chat
      )
    )
  }

  const deleteChat = (chatId: string) => {
    setChatHistory(prevHistory => 
      prevHistory.filter(chat => chat.id !== chatId)
    )
  }

  const getGroupedChatHistory = () => groupChatsByDate(chatHistory)

  return (
    <ChatContext.Provider value={{ 
      chatHistory, 
      setChatHistory, 
      getGroupedChatHistory, 
      togglePinChat, 
      deleteChat
    }}>
      {children}
    </ChatContext.Provider>
  )
}
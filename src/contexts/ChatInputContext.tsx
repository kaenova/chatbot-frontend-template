'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatInputContextType {
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  clearInput: () => void
}

const ChatInputContext = createContext<ChatInputContextType | undefined>(undefined)

export function useChatInput() {
  const context = useContext(ChatInputContext)
  if (!context) {
    throw new Error('useChatInput must be used within a ChatInputProvider')
  }
  return context
}

interface ChatInputProviderProps {
  children: ReactNode
}

export function ChatInputProvider({ children }: ChatInputProviderProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const clearInput = () => setInput('')

  return (
    <ChatInputContext.Provider value={{
      input,
      setInput,
      isLoading,
      setIsLoading,
      clearInput
    }}>
      {children}
    </ChatInputContext.Provider>
  )
}

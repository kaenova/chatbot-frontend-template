'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import UserMessage from '@/components/UserMessage'
import AssistantMessage from '@/components/AssistantMessage'
import LoadingMessage from '@/components/LoadingMessage'
import ChatInput from '@/components/ChatInput'
import { decodeBase64 } from '@/lib/chat-utils'

interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number // epoch milliseconds
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.conversationId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load conversation history on mount
  const loadConversationHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true)
      setError(null)

      const response = await fetch(`/api/conversations/${conversationId}/chats?limit=50`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Conversation not found')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json() as Message[]
      // Sort messages by timestamp (oldest first for display)
      const sortedMessages = data.sort((a, b) => a.timestamp - b.timestamp)
      setMessages(sortedMessages)

    } catch (err) {
      console.error('Load conversation history error:', err)
      setError('Failed to load conversation history')
    } finally {
      setIsLoadingHistory(false)
    }
  }, [conversationId])

  useEffect(() => {
    if (conversationId) {
      loadConversationHistory()
    }
  }, [conversationId, loadConversationHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: conversationId,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      conversation_id: conversationId,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await fetch('/api/chat/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: userMessage.content,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response stream')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let receivedConversationId: string | undefined

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            // Handle streaming chunks
            if (line.startsWith('convid:')) {
              receivedConversationId = line.substring(7) // Remove 'convid:' prefix
              // If this is a different conversation ID, redirect to it
              if (receivedConversationId !== conversationId) {
                router.push(`/chat/${receivedConversationId}`)
                return
              }
            } else if (line.startsWith('c:')) {
              const contentChunk = line.substring(2) // Remove 'c:' prefix
              const decodedChunk = decodeBase64(contentChunk)
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + decodedChunk }
                    : msg
                )
              )
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat inference error:', error)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'Sorry, there was an error processing your request.' }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const messageContainer = document.getElementById('main-message')
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  if (isLoadingHistory) {
    return (
      <div className="flex-1 flex flex-col relative max-h-screen overflow-y-hidden" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600">Loading conversation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col relative max-h-screen overflow-y-hidden" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-lg">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900">Error</h2>
            <p className="text-gray-600 max-w-md">{error}</p>
            <button
              onClick={() => router.push('/chat')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Chat
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col relative max-h-screen overflow-y-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Chat Messages - Full Height */}
      <div id="main-message" className="flex-1 overflow-y-auto p-6 pb-32 scroll-smooth no-scrollbar md:pt-6 pt-20">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            // Empty conversation state
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-6 max-w-4xl">
                <div className="text-4xl mb-4">💬</div>
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--accent)' }}>
                  Start a conversation
                </h1>
                <p className="text-gray-600 max-w-md mx-auto">
                  This conversation is empty. Send your first message to get started!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' ? (
                  <AssistantMessage message={message} />
                ) : (
                  <UserMessage message={message} />
                )}
              </div>
            ))
          )}
          {isLoading && <LoadingMessage />}
        </div>
      </div>

      {/* Floating Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}

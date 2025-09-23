'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import UserMessage from '@/components/UserMessage'
import AssistantMessage from '@/components/AssistantMessage'
import LoadingMessage from '@/components/LoadingMessage'
import ChatInput from '@/components/ChatInput'
import { decodeBase64 } from '@/lib/chat-utils'
import { siteConfig } from '@/lib/site-config'

interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number // epoch milliseconds
}

// Memoized component to prevent re-rendering of messages when streaming content changes
const MessagesList = React.memo(({ messages }: { messages: Message[] }) => {
  return (
    <>
      {messages.map((message) => (
        <div key={message.id} className={`${message.role === 'user' ? 'justify-end' : 'justify-start'} max-w-screen flex px-2 md:p-0 overflow-clip`}>
          {message.role === 'assistant' ? (
            <AssistantMessage message={message} />
          ) : (
            <UserMessage message={message} />
          )}
        </div>
      ))}
    </>
  )
})

MessagesList.displayName = 'MessagesList'

// Memoized component for streaming message to avoid unnecessary re-renders
const StreamingMessage = React.memo(({
  streamingMessage
}: {
  streamingMessage: { id: string; content: string } | null;
}) => {
  if (!streamingMessage) return null;

  return (
    <div className="flex justify-start mb-40">
      <AssistantMessage
        message={{
          id: streamingMessage.id,
          role: 'assistant',
          content: streamingMessage.content,
          timestamp: Date.now()
        }}
      />
    </div>
  );
})

StreamingMessage.displayName = 'StreamingMessage'

// Load More Button Component
const LoadMoreButton = React.memo(({ 
  hasMoreMessages, 
  isLoadingMore, 
  onLoadMore 
}: { 
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) => {
  if (!hasMoreMessages) return null;

  return (
    <div className="flex justify-center mb-4">
      <button
        onClick={onLoadMore}
        disabled={isLoadingMore}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 rounded-lg transition-colors duration-200 text-sm font-medium"
      >
        {isLoadingMore ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            <span>Loading...</span>
          </div>
        ) : (
          'Load more messages'
        )}
      </button>
    </div>
  );
})

LoadMoreButton.displayName = 'LoadMoreButton'

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.conversationId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for load more functionality
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [oldestTimestamp, setOldestTimestamp] = useState<number | null>(null)

  // Separate state for streaming content to avoid re-rendering all messages
  const [streamingMessage, setStreamingMessage] = useState<{
    id: string
    content: string
  } | null>(null)

  // Auto-scroll to bottom when component mounted
  useEffect(() => {
    const messageContainer = document.getElementById('main-message')
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [isLoadingHistory])

  // Load conversation history on mount
  const loadConversationHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true)
      setError(null)

      const response = await fetch(`/api/conversations/${conversationId}/chats?limit=${siteConfig.chat.messageLimit}`)

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
      
      // Set pagination state
      if (sortedMessages.length > 0) {
        setOldestTimestamp(sortedMessages[0].timestamp)
        // If we got fewer messages than requested, there are no more
        setHasMoreMessages(data.length === siteConfig.chat.messageLimit)
      } else {
        setHasMoreMessages(false)
      }

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

  // Load more (older) messages
  const loadMoreMessages = useCallback(async () => {
    if (!oldestTimestamp || isLoadingMore) return

    try {
      setIsLoadingMore(true)
      setError(null)

      const response = await fetch(`/api/conversations/${conversationId}/chats?limit=${siteConfig.chat.messageLimit}&last_timestamp=${oldestTimestamp}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json() as Message[]
      
      if (data.length === 0) {
        setHasMoreMessages(false)
        return
      }

      // Sort new messages by timestamp (oldest first for display)
      const sortedNewMessages = data.sort((a, b) => a.timestamp - b.timestamp)
      
      // Prepend new messages to existing ones (older messages go at the beginning)
      setMessages(prev => [...sortedNewMessages, ...prev])
      
      // Update oldest timestamp for next pagination
      setOldestTimestamp(sortedNewMessages[0].timestamp)
      
      // If we got fewer messages than requested, there are no more
      setHasMoreMessages(data.length === siteConfig.chat.messageLimit)

    } catch (err) {
      console.error('Load more messages error:', err)
      setError('Failed to load more messages')
    } finally {
      setIsLoadingMore(false)
    }
  }, [conversationId, oldestTimestamp, isLoadingMore])

  const handleSubmit = async (e: React.FormEvent, input: string) => {
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
    setIsLoading(true)

    // After streaming is complete, scroll to the bottom
    const messageContainer = document.getElementById('main-message')
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      })
    }

    // Create assistant message placeholder and set up streaming state
    const assistantMessageId = (Date.now() + 1).toString()
    setStreamingMessage({
      id: assistantMessageId,
      content: ''
    })

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
      let accumulatedContent = ''

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
              accumulatedContent += decodedChunk

              // Update streaming message state instead of all messages
              setStreamingMessage(prev => prev ? {
                ...prev,
                content: accumulatedContent
              } : null)
            }
          }
        }
      }

      // After streaming is complete, add the final message to messages and clear streaming state
      const finalAssistantMessage: Message = {
        id: assistantMessageId,
        conversation_id: conversationId,
        role: 'assistant',
        content: accumulatedContent,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, finalAssistantMessage])
      setStreamingMessage(null)

      // After streaming is complete, scroll to the bottom
      const messageContainer = document.getElementById('main-message')
      if (messageContainer) {
        messageContainer.scrollTo({
          top: messageContainer.scrollHeight,
          behavior: 'smooth'
        })
      }
    } catch (error) {
      console.error('Chat inference error:', error)

      // Add error message and clear streaming state
      const errorMessage: Message = {
        id: streamingMessage?.id || (Date.now() + 1).toString(),
        conversation_id: conversationId,
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, errorMessage])
      setStreamingMessage(null)
    } finally {
      setIsLoading(false)
    }
  }



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
      <div id="main-message" className="flex-1 overflow-y-auto md:p-6 pb-32 scroll-smooth no-scrollbar md:pt-6 pt-20">
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
            <>
              <LoadMoreButton 
                hasMoreMessages={hasMoreMessages}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMoreMessages}
              />
              <MessagesList messages={messages} />
              <StreamingMessage streamingMessage={streamingMessage} />
              <div className='w-full md:h-20'></div>
            </>
          )}
          {isLoading && !streamingMessage && <LoadingMessage />}
        </div>
      </div>

      {/* Floating Input */}
      <ChatInput
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}

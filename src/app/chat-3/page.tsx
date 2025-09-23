'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import UserMessage from '@/components/UserMessage'
import AssistantMessage from '@/components/AssistantMessage'
import LoadingMessage from '@/components/LoadingMessage'
import ChatInput from '@/components/ChatInput'
import { siteConfig } from '@/lib/site-config'
import { decodeBase64 } from '@/lib/chat-utils'

// Re-define Message interface here or import from a shared type file if available
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number // epoch milliseconds
}

// Memoized component to prevent re-rendering of messages when streaming content changes
const MessagesList = React.memo(({ messages }: { messages: Message[] }) => {
  return (
    <>
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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


export default function ChatPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [Input, setInput] = useState('')
  
  // Separate state for streaming content to avoid re-rendering all messages
  const [streamingMessage, setStreamingMessage] = useState<{
    id: string
    content: string
  } | null>(null)

  // Function to get time-based greeting
  const getGreeting = () => {
    const now = new Date()
    const hour = now.getHours()

    if (hour < 12) {
      return siteConfig.chat.greeting.morning
    } else if (hour < 18) {
      return siteConfig.chat.greeting.afternoon
    } else {
      return siteConfig.chat.greeting.evening
    }
  }

  // Get recommendation questions from site config
  const recommendationQuestions = siteConfig.chat.recommendationQuestions

  // Function to handle clicking on a recommendation question
  const handleRecommendationClick = (question: string) => {
    setInput(question)
    console.log('Set input to:', question)
    // Optionally auto-submit the question
    // handleSubmit(new Event('submit') as any)
  }

  const handleSubmit = async (e: React.FormEvent, input: string) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

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

      // After streaming is complete, redirect to the conversation page
      if (receivedConversationId) {
        router.push(`/chat/${receivedConversationId}`)
      }
    } catch (error) {
      console.error('Chat inference error:', error)
      
      // Add error message and clear streaming state
      const errorMessage: Message = {
        id: streamingMessage?.id || (Date.now() + 1).toString(),
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

  return (
    <div className="flex-1 flex flex-col relative max-h-screen overflow-y-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Chat Messages - Full Height */}
      <div id="main-message" className="flex-1 overflow-y-auto p-6 pb-32 scroll-smooth no-scrollbar md:pt-6 pt-20">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            // Welcome placeholder for new chats
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-6 max-w-4xl">
                <div className="text-4xl mb-4">👋</div>
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--accent)' }}>
                  {getGreeting()}, {session?.user?.name || 'there'}!
                </h1>
                <p className="text-gray-600 max-w-md mx-auto">
                  {siteConfig.chat.welcomeMessage}
                </p>

                {/* Recommendation Questions */}
                <div className="mt-8 flex gap-3 max-w-full flex-wrap justify-center">
                  {recommendationQuestions.slice(0, 6).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecommendationClick(question)}
                      className="p-4 text-left rounded-full border hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                      style={{
                        borderColor: 'var(--accent)',
                        backgroundColor: 'var(--card)',
                      }}
                    >
                      <span className="block truncate">{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <MessagesList messages={messages} />
              <StreamingMessage streamingMessage={streamingMessage} />
              <div className='w-full h-5 md:h-20'></div>
            </>
          )}
          {isLoading && !streamingMessage && <LoadingMessage />}
        </div>
      </div>


      {/* Floating Input */}
      <ChatInput
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        input={Input}
      />
    </div>
  )
}

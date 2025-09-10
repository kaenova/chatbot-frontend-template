'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import UserMessage from '@/components/UserMessage'
import AssistantMessage from '@/components/AssistantMessage'
import LoadingMessage from '@/components/LoadingMessage'
import ChatInput from '@/components/ChatInput'
import { siteConfig } from '@/lib/site-config'
import { decodeBase64 } from '@/lib/chat-utils'
import { useChatInput } from '@/contexts/ChatInputContext'

// Re-define Message interface here or import from a shared type file if available
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number // epoch milliseconds
}


export default function ChatPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { setInput, setIsLoading, isLoading } = useChatInput()
  const [messages, setMessages] = useState<Message[]>([])

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

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
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

      // After streaming is complete, redirect to the conversation page
      if (receivedConversationId) {
        router.push(`/chat/${receivedConversationId}`)
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


  // useEffect(() => {
  //   const messageContainer = document.getElementById('main-message')
  //   if (messageContainer) {
  //     // messageContainer.scrollTo({
  //     //   top: messageContainer.scrollHeight,
  //     //   behavior: 'smooth'
  //     // })
  //   }
  // }, [messages])

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
        handleSubmit={handleSubmit}
      />
    </div>
  )
}

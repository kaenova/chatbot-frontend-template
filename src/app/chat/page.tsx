'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import UserMessage from '@/components/UserMessage'
import AssistantMessage from '@/components/AssistantMessage'
import LoadingMessage from '@/components/LoadingMessage'
import ChatInput from '@/components/ChatInput'

// Re-define Message interface here or import from a shared type file if available
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Function to get time-based greeting
  const getGreeting = () => {
    const now = new Date()
    const hour = now.getHours()

    if (hour < 12) {
      return 'Good morning'
    } else if (hour < 18) {
      return 'Good afternoon'
    } else {
      return 'Good evening'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Thank you for your message: "${userMessage.content}". This is a placeholder response. In a real implementation, this would be connected to an AI service like OpenAI's GPT API.

Here are some **markdown features** that are supported:

| Feature | Description | Example |
|---------|-------------|---------|
| **Bold** | Makes text bold | \`**text**\` |
| *Italic* | Makes text italic | \`*text*\` |
| \`Code\` | Inline code formatting | \`\`code\`\` |
| Tables | Structured data display | See below |
| Lists | Bulleted or numbered lists | - Item 1<br>- Item 2 |
- **Bold text**
- *Italic text*
- \`Inline code\`
- Lists like this one

\`\`\`js
// Code blocks are also supported
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\``,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }


  useEffect(() => {
    const messageContainer = document.getElementById('main-message')
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  return (
    <div className="flex-1 flex flex-col relative max-h-screen overflow-y-hidden">
      {/* Chat Messages - Full Height */}
      <div id="main-message" className="flex-1 overflow-y-auto p-6 pb-32 scroll-smooth no-scrollbar md:pt-6 pt-20">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              // Welcome placeholder for new chats
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-4">👋</div>
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-500">
                    {getGreeting()}, {session?.user?.name || 'there'}!
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    I&apos;m your AI assistant. Start a conversation by typing a message below.
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

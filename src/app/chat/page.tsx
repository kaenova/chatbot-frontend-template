'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ChatHeader from '@/components/ChatHeader'
import MobileSidebar from '@/components/MobileSidebar'
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
  const [chatTitle, setChatTitle] = useState('New Chat')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
- **Bold text**
- *Italic text*
- \`Inline code\`
- Lists like this one

\`\`\`javascript
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

  // Close mobile sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    <>
      {/* Mobile Sidebar */}
      <MobileSidebar 
        user={session?.user || { name: 'User', email: 'user@example.com' }}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col relative max-h-screen overflow-y-hidden">
        {/* Chat Messages - Full Height */}
        <div id="main-message" className="flex-1 overflow-y-auto pt-20 p-6 pb-32 scroll-smooth no-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' ? (
                  <AssistantMessage message={message} />
                ) : (
                  <UserMessage message={message} />
                )}
              </div>
            ))}
            {isLoading && <LoadingMessage />}
          </div>
        </div>

        {/* Floating Chat Header - Overlaid on top */}
        <div className="absolute top-0 left-0 right-0 z-30 ">
          <ChatHeader
            title={chatTitle}
            onTitleChange={setChatTitle}
            onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          />
        </div>

        {/* Floating Input */}
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </>
  )
}

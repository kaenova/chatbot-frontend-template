'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ChatHeader from '@/components/ChatHeader'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [chatTitle, setChatTitle] = useState('New Chat')
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
        // No action needed - GlobalNavbar handles mobile sidebar
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <div className="flex-1 flex flex-col relative">
        {/* Chat Header */}
        <ChatHeader
          title={chatTitle}
          onTitleChange={setChatTitle}
          onMobileMenuToggle={() => {
            // Mobile menu toggle is handled by GlobalNavbar
          }}
        />
        
        {/* Chat Messages - Full Height with Floating Input */}
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' ? (
                  <div className="flex max-w-3xl w-full space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="max-w-full text-gray-900">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-left">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-4 items-start">
                    <div className="flex flex-col items-end">
                      <div className="bg-blue-500 text-white p-4 rounded-lg max-w-md">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-3xl w-full space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 text-gray-600 p-4 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Input */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent pt-8">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 pb-6">
            <div className="flex space-x-4 items-end">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                  className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg min-h-[56px] max-h-[200px]"
                  rows={1}
                  disabled={isLoading}
                  style={{
                    height: 'auto',
                    minHeight: '56px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 200) + 'px'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-colors shadow-lg flex-shrink-0 h-[56px] w-[56px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

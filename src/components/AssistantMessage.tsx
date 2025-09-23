import React from 'react'
import MarkdownContent from './MarkdownContent'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number // epoch milliseconds
}

interface AssistantMessageProps {
  message: Message
  showIcon?: boolean
}

export default function AssistantMessage({ message, showIcon = false }: AssistantMessageProps) {
  return (
    <div className="flex max-w-3xl w-full space-x-4">
      {showIcon && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
      )}
      <div className="flex-1">
        <div className="max-w-full" style={{ color: 'var(--foreground)' }}>
          <MarkdownContent content={message.content} className='max-w-screen' />
        </div>
        <div className="text-xs text-gray-500 mt-1 text-left">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
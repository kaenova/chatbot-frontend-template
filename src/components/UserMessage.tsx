import React from 'react'
import MarkdownContent from './MarkdownContent'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number // epoch milliseconds
}

interface UserMessageProps {
  message: Message
  showIcon?: boolean
}

export default function UserMessage({ message, showIcon = false }: UserMessageProps) {
  return (
    <div className="flex space-x-4 items-start">
      <div className="flex flex-col items-end">
        <div className="text-white px-4 py-2 rounded-lg max-w-md" style={{ backgroundColor: 'var(--primary)' }}>
          <MarkdownContent
            content={message.content}
            className="!text-white prose-invert prose-p:m-0 prose-p:text-white prose-headings:text-white prose-strong:text-white prose-code:text-gray-200 prose-a:text-gray-200 text-wrap break-words"
          />
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
      {showIcon && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
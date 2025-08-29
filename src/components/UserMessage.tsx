import React from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UserMessageProps {
  message: Message
}

export default function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex space-x-4 items-start">
      <div className="flex flex-col items-end">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-md">
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
  )
}
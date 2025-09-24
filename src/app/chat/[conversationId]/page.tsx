'use client'

import React, { useState } from 'react'
import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider, ThreadHistoryAdapter } from '@assistant-ui/react';
import { useParams } from 'next/navigation';
import { useDataStreamRuntime } from '@assistant-ui/react-data-stream';
import {ThreadMessage} from '@assistant-ui/react'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BackendMessage {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string | { type: string; [key: string]: any }[]
    createdAt: string // ISO date string
    status?: { type: string; reason: string } | null
    metadata: { custom: Record<string, any> },
    attchments?: any[] // Only for user messages
  },
  parentId: string | null
}

function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const HistoryAdapter: ThreadHistoryAdapter = {
    async load() {
      try {
        if (!conversationId) {
          return { messages: [] };
        }

        setIsLoadingHistory(true)
        setError(null)

        const fetchURL = `/api/be/conversations/${conversationId}`

        // Load messages from your existing conversation API
        const response = await fetch(fetchURL);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Conversation not found, set error and return empty messages
            setError('Conversation not found')
            setIsLoadingHistory(false)
            return { messages: [] };
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resMsg: BackendMessage[] = await response.json();

        function mapBackendToThreadMessage(msg: BackendMessage): {message: ThreadMessage, parentId: string | null} {
          
          const adjustedContent: { type: string; [key: string]: any }[] = []
          if (typeof msg.message.content === 'string') {
            adjustedContent.push({ type: 'text', text: msg.message.content })
          }
          else if (Array.isArray(msg.message.content)) {
            for (const contentItem of msg.message.content) {
              if (contentItem.type === 'text' && typeof contentItem.text === 'string') {
                adjustedContent.push({ type: 'text', text: contentItem.text })
              }
            }
          }

          return {
            parentId: msg.parentId,
            message: {
              id: msg.message.id,
              role: msg.message.role,
              // @ts-expect-error // The type definition in assistant-ui seems incorrect for content, currentluy only support string text
              content: adjustedContent,
              createdAt: new Date(msg.message.createdAt),
              metadata: { custom: {} },
              ...(msg.message.role === 'user' ? { attachments: [] } : {}),
              ...(msg.message.role === 'assistant' ? { status: { type: 'complete', reason: 'stop' } } : {}),
            }
          }
        
        }
        
        // Convert backend message format to assistant-ui format
        const messages = resMsg
          .map((d) => mapBackendToThreadMessage(d));
        console.log(messages)
        setIsLoadingHistory(false)
        return { messages: messages };
      } catch (error) {
        console.error('Failed to load conversation history:', error);
        setError('Failed to load conversation history')
        setIsLoadingHistory(false)
        return { messages: [] };
      }
    },

    async append(message) {
      // The message will be saved automatically by your backend when streaming completes
      // You might want to implement this if you need to save messages immediately
      console.log('Message appended:', message);
    },
  }

   const runtime = useDataStreamRuntime({
    api: '/api/be/conversations/' + conversationId + '/chat',
    adapters: {
      history: HistoryAdapter,
    }
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className='h-screen pt-16 md:pt-0'>
        {isLoadingHistory ? (
          // Show loading state while fetching conversation history
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600">Loading conversation...</p>
            </div>
          </div>
        ) : error ? (
          // Show error state if conversation failed to load
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="text-red-500 text-2xl">😕</div>
              <h2 className="text-xl font-semibold text-gray-800">Oops!</h2>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          // Show main chat interface
          <Thread />
        )}
      </div>
    </AssistantRuntimeProvider>
  )
}

export default ChatPage
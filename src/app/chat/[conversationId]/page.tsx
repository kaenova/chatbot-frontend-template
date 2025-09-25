'use client'

import React, { useState } from 'react'
import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider, ThreadHistoryAdapter } from '@assistant-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useDataStreamRuntime } from '@assistant-ui/react-data-stream';
import { extractConversationFromHistory } from '@/lib/langgraph-message-conversion';

function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const HistoryAdapter: ThreadHistoryAdapter = {

    // @ts-expect-error // conversationId might be undefined during initial render
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
            router.push('/not-found')
            setError('Conversation not found')
            return { messages: [] };
          }
          setIsLoadingHistory(false)
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resMsg = await response.json();

        const messagesData = extractConversationFromHistory(resMsg);

        setIsLoadingHistory(false)
        return { messages: messagesData };
      } catch (error) {
        console.error('Failed to load conversation history:', error);
        setError('Failed to load conversation history')
        setIsLoadingHistory(false)
        return { messages: [] };
      }
    },

    async append() {
      // The message will be saved automatically by your backend when streaming completes
      // You might want to implement this if you need to save messages immediately
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
        {error ? (
          // Show error state if conversation failed to load
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="text-red-500 text-2xl">😕</div>
              <h2 className="text-xl font-semibold text-gray-800">Oops!</h2>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary/85 hover:bg-primary text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          // Show main chat interface with loading skeleton when needed
          <Thread isLoading={isLoadingHistory} />
        )}
      </div>
    </AssistantRuntimeProvider>
  )
}

export default ChatPage
'use client'

import React, { useState, useEffect } from 'react'
import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider, ChatModelAdapter, ThreadHistoryAdapter, useLocalRuntime } from '@assistant-ui/react';
import { decodeBase64 } from '@/lib/chat-utils';
import { useParams } from 'next/navigation';
interface BackendMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const MyModelAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    // Get the last user message to send to your backend
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('No user message found');
    }

    // Extract text content from the message
    const messageContent = lastMessage.content
      .filter((content) => content.type === 'text')
      .map((content) => (content as { type: 'text'; text: string }).text)
      .join('');

    try {
      // Call your existing backend API with conversation ID
      const response = await fetch('/api/chat/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          conversation_id: conversationId,
        }),
        signal: abortSignal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            // Handle streaming chunks
            if (line.startsWith('convid:')) {
              // Handle conversation ID if needed for your use case
              // const conversationId = line.substring(7);
              // You could store this in context or handle it as needed
            } else if (line.startsWith('c:')) {
              const contentChunk = line.substring(2); // Remove 'c:' prefix
              const decodedChunk = decodeBase64(contentChunk);
              accumulatedContent += decodedChunk;
              
              // Yield the accumulated content
              yield {
                content: [{ type: "text", text: accumulatedContent }],
              };
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Handle abort gracefully
        return;
      }
      throw error;
    }
  },
};

  const HistoryAdapter: ThreadHistoryAdapter = {
    async load() {
      try {
        setIsLoadingHistory(true)
        setError(null)


        const fetchURL = `/api/conversations/${conversationId}/chats?limit=50`

        console.log(fetchURL)
        
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


        const backendMessages: BackendMessage[] = await response.json();

        console.log(backendMessages)
        
        // Convert backend message format to assistant-ui format
        const messages = backendMessages
          .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp
          .map((msg, index) => ({
            message: {
              id: msg.id,
              role: msg.role,
              content: [{ type: 'text', text: msg.content }],
              createdAt: new Date(msg.timestamp),
              status: msg.role === 'assistant' ? { type: 'complete', reason: 'stop' } : undefined,
              metadata: { custom: {} },
              ...(msg.role === 'user' ? { attachments: [] } : {}),
            } as import('@assistant-ui/react').ThreadMessage, // Type assertion for compatibility
            parentId: index > 0 ? backendMessages[index - 1].id : null,
          }));
        console.log(messages)
        setIsLoadingHistory(false)
        return { messages };
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

    const runtime = useLocalRuntime(MyModelAdapter, {
      adapters: {
        history: HistoryAdapter,
      }
    });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className='h-screen'>
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
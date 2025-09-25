'use client'

import React, {useState, useEffect} from 'react'
import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider, useAssistantState } from '@assistant-ui/react';
import { useDataStreamRuntime } from "@assistant-ui/react-data-stream";
import { useRouter } from 'next/navigation';

function RedirectWhenDone() {
  const router = useRouter()
  const [FirstRunning, setFirstRunning] = useState(false)
  const isRunning = useAssistantState(({ thread }) => thread.isRunning); // boolean


  async function getLastConversationIdAndRedirect() {
    // Fetch the last conversation and get its ID
    const response = await fetch('/api/be/last-conversation-id')

    if (response.ok) {
      const data = await response.json();
      const conversationId = data.lastConversationId;
      router.push('/chat/' + conversationId);
    } else {
      console.error('Failed to fetch last conversation ID');
    }
  }

  // Handle the redirection when the chat is done
  useEffect(() => {
    if (isRunning) {
      setFirstRunning(true)
    }

    if (!isRunning && FirstRunning) {
      getLastConversationIdAndRedirect()
    }
  }, [isRunning])
  
  return <></>
}


function ChatPage() {

  const runtime = useDataStreamRuntime({
    api: '/api/be/chat',
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RedirectWhenDone />
      <div className='h-screen pt-16 md:pt-0'>
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  )
}

export default ChatPage
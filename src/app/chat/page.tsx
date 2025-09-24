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

import {
  AttachmentAdapter,
  PendingAttachment,
  CompleteAttachment,
} from "@assistant-ui/react";

class VisionImageAdapter implements AttachmentAdapter {
  accept = "image/jpeg,image/png,image/webp,image/gif";

  async add({ file }: { file: File }): Promise<PendingAttachment> {
    // Validate file size (e.g., 20MB limit for most LLMs)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new Error("Image size exceeds 20MB limit");
    }

    // Return pending attachment while processing
    return {
      id: crypto.randomUUID(),
      type: "image",
      name: file.name,
      file,
      // @ts-expect-error // Another error from assistant-ui types
      status: { type: "running" },
    };
  }

  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    // Convert image to base64 data URL
    const base64 = await this.fileToBase64DataURL(attachment.file);

    // Return in assistant-ui format with image content
    return {
      id: attachment.id,
      type: "image",
      name: attachment.name,
      content: [
        {
          type: "image",
          image: base64, // data:image/jpeg;base64,... format
        },
      ],
      status: { type: "complete" },
    };
  }

  async remove(attachment: PendingAttachment): Promise<void> {
    // Cleanup if needed (e.g., revoke object URLs if you created any)
  }

  private async fileToBase64DataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // FileReader result is already a data URL
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

function ChatPage() {

  

  const runtime = useDataStreamRuntime({
    api: '/api/be/chat',
    adapters: {
      attachments: new VisionImageAdapter()
    }
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {/* <RedirectWhenDone /> */}
      <div className='h-screen mt-16'>
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  )
}

export default ChatPage
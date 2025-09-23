'use client'

import React from 'react'

interface ChatInputProps {
  handleSubmit: (e: React.FormEvent, input: string) => void
  isLoading: boolean,
  input?: string,
}

export default function ChatInput({ handleSubmit, isLoading, input }: ChatInputProps) {
  const [Input, setInput] = React.useState('')

  React.useEffect(() => {
    setInput(Input || input || '')
  }, [input, Input])


  return (
    <div className="absolute bottom-0 left-0 right-0 pt-14" style={{ background: `linear-gradient(to top, var(--background), var(--background), transparent)` }}>
      <form onSubmit={(e) => handleSubmit(e, Input)} className="max-w-4xl mx-auto px-6 pb-6">
        <div className="flex space-x-4 items-start">
          <div className="flex-1">
            <textarea
              value={Input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  setInput('')
                  handleSubmit(e, Input)
                }
              }}
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              className="resize-y w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent shadow-lg min-h-[56px]"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                height: 'auto',
                minHeight: '56px'
              }}
              disabled={isLoading}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 200) + 'px'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!Input.trim() || isLoading}
            className="hover:opacity-80 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-colors shadow-lg flex-shrink-0 h-[56px] w-[56px] flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
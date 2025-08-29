import React from 'react'

interface ChatInputProps {
  input: string
  setInput: (input: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

export default function ChatInput({ input, setInput, handleSubmit, isLoading }: ChatInputProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent pt-20">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 pb-6">
        <div className="flex space-x-4 items-start">
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
              className="resize-y bg-white w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg min-h-[56px] text-black"
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
  )
}
'use client'

import { useState } from 'react'

interface ChatHeaderProps {
  title: string
  onTitleChange: (newTitle: string) => void
  onMobileMenuToggle: () => void
}

export default function ChatHeader({ title, onTitleChange, onMobileMenuToggle }: ChatHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)

  const handleTitleSubmit = () => {
    if (editValue.trim()) {
      onTitleChange(editValue.trim())
    } else {
      setEditValue(title)
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit()
    } else if (e.key === 'Escape') {
      setEditValue(title)
      setIsEditing(false)
    }
  }

  return (
    <header className="backdrop-blur-xl border-b border-white/30 px-4 py-3 flex items-center justify-between w-full shadow-sm" style={{ backgroundColor: 'var(--header-bg)' }}>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors border border-white/30"
        title="Open menu"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Title Section - Centered */}
      <div className="flex-1 flex justify-center">
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleKeyPress}
            className="text-lg font-semibold text-white bg-transparent border-b-2 border-white outline-none text-center max-w-xs placeholder-white/70"
            autoFocus
            placeholder="Enter chat title"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-lg font-semibold text-white hover:text-white/80 transition-colors px-2 py-1 rounded hover:bg-white/10"
            title="Click to edit title"
          >
            {title}
          </button>
        )}
      </div>

      {/* Right spacer to balance the layout */}
      <div className="w-10 md:hidden"></div>
    </header>
  )
}

'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import Fuse from 'fuse.js'
import { useChat } from '@/contexts/ChatContext'
import { useRouter } from 'next/navigation'

interface ChatSearchProps {
  isCollapsed?: boolean
  isMobile?: boolean
  onChatSelect?: () => void
}

interface ChatItem {
  id: string
  title: string
  date: string
}

export default function ChatSearch({ isCollapsed = false, isMobile = false, onChatSelect }: ChatSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ChatItem[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { chatHistory } = useChat()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fuse.js configuration for fuzzy search - memoized to prevent recreation
  const fuse = useMemo(() => new Fuse(chatHistory, {
    keys: ['title'],
    threshold: 0.4, // Lower threshold = more strict matching
    distance: 100,
    includeScore: true,
    minMatchCharLength: 1
  }), [chatHistory])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([])
      setIsDropdownOpen(false)
      return
    }

    const results = fuse.search(searchQuery).map(result => result.item)
    setSearchResults(results)
    setIsDropdownOpen(results.length > 0)
  }, [searchQuery, fuse])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle chat selection
  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    setSearchQuery('')
    setIsDropdownOpen(false)
    onChatSelect?.()
  }

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsDropdownOpen(false)
    inputRef.current?.focus()
  }

  // Handle search activation for collapsed mode
  const handleSearchActivation = () => {
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  if (isCollapsed) {
    return (
      <div className="px-2 mb-2">
        <button
          onClick={handleSearchActivation}
          className="w-full p-2 rounded-full hover:bg-gray-200 transition-colors flex justify-center"
          title="Search chats"
        >
          <Search className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    )
  }

  return (
    <div ref={searchRef} className={`relative ${isMobile ? 'px-4 mb-4' : 'px-4 mb-4'}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isDropdownOpen && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="py-1">
            {searchResults.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-500">{chat.date}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {isDropdownOpen && searchQuery && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-4 px-4 text-center text-gray-500 text-sm">
            No chats found for &ldquo;{searchQuery}&rdquo;
          </div>
        </div>
      )}
    </div>
  )
}

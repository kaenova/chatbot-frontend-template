'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface MenuButtonProps {
  isCollapsed?: boolean
}

export default function MenuButton({ isCollapsed = false }: MenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleMenuClick = (path: string) => {
    setIsOpen(false)
    if (path === '/chat' && pathname.startsWith('/chat')) {
      // Stay on current page if already in chat
      return
    }
    router.push(path)
  }

  return (
    <div className="relative">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'} flex items-center ${isCollapsed ? 'px-2 py-2' : 'px-4 py-2'} hover:bg-gray-700 rounded-lg transition-colors text-white`}
        title={isCollapsed ? 'Menu' : ''}
      >
        {/* Hamburger Icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        {!isCollapsed && <span className="ml-3">Menu</span>}
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Items */}
          <div className={`absolute bottom-full left-0 mb-2 ${isCollapsed ? 'w-48' : 'w-full'} bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20`}>
            <div className="py-2">
              <button
                onClick={() => handleMenuClick('/chat')}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.883 8a9.864 9.864 0 01-4.601-1.139L3 21l2.139-3.516C4.381 16.275 4 14.193 4 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                </svg>
                Chat
              </button>

              <button
                onClick={() => handleMenuClick('/resource-management')}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Resource Management
              </button>

              <button
                onClick={() => handleMenuClick('/settings')}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getNavigationItems } from '@/lib/site-config'
import NavIcon from './NavIcon'

interface MenuButtonProps {
  isCollapsed?: boolean
}

export default function MenuButton({ isCollapsed = false }: MenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  // Get menu items from site config
  const menuItems = getNavigationItems('menu')

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
        className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'} flex items-center ${isCollapsed ? 'px-2 py-2' : 'px-4 py-2'} hover:bg-gray-200 rounded-lg transition-colors`}
        style={{ color: 'var(--foreground)' }}
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
      {isOpen && !isCollapsed && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Items */}
          <div className={`absolute bottom-full left-0 mb-2 ${isCollapsed ? 'w-48' : 'w-full'} rounded-lg shadow-lg border border-gray-300 z-20`} style={{ backgroundColor: 'var(--background)' }}>
            <div className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.path)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-200 transition-colors flex items-center"
                  style={{ color: 'var(--foreground)' }}
                  title={item.description}
                >
                  <NavIcon iconSvg={item.icon.svg} className="w-4 h-4 mr-3" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
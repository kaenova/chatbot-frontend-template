'use client'

import { signOut } from "next-auth/react"
import { User } from "next-auth"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useChat } from "@/contexts/ChatContext"
import MenuButton from "./MenuButton"

interface GlobalNavbarProps {
  user: User
}

export default function GlobalNavbar({ user }: GlobalNavbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { chatHistory } = useChat()
  const router = useRouter()
  const pathname = usePathname()

  // Get mobile title based on current page
  const getMobileTitle = () => {
    if (pathname.startsWith('/chat')) {
      // For chat pages, find current chat title or use "New Chat"
      const chatId = pathname.split('/chat/')[1]
      if (chatId) {
        const currentChat = chatHistory.find(chat => chat.id === chatId)
        return currentChat?.title || 'Chat'
      }
      return 'New Chat'
    } else if (pathname.startsWith('/resource-management')) {
      return 'Resource Management'
    } else if (pathname.startsWith('/settings')) {
      return 'Settings'
    }
    return 'Dashboard'
  }

  // Handle chat item click
  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    setIsMobileSidebarOpen(false)
  }

  // Handle new chat
  const handleNewChat = () => {
    router.push('/chat')
    setIsMobileSidebarOpen(false)
  }

  // Close mobile sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-50/60 backdrop-blur-xl border-b border-white/30 px-4 py-3 flex items-center justify-between shadow-sm">
        {/* Burger Menu Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-200/50 transition-colors border border-gray-300/50"
          title="Open menu"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Title */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-semibold text-gray-800">
            {getMobileTitle()}
          </h1>
        </div>

        {/* Spacer for balance */}
        <div className="w-10"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black transition-opacity duration-300 z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Mobile Sidebar */}
          <div className="fixed inset-0 w-full bg-gray-900 text-white flex flex-col z-50 md:hidden transform transition-transform duration-300 ease-in-out translate-x-0 max-h-screen overflow-hidden">
            {/* Header with Close Button */}
            <div className="flex-shrink-0 p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold">ChatGPT Clone</h1>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* New Chat Button */}
            <div className="flex-shrink-0 p-4">
              <button
                onClick={handleNewChat}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Chat</span>
              </button>
            </div>

            {/* Chat History - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Chats</h3>
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className="group">
                      <div
                        className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                        onClick={() => handleChatClick(chat.id)}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.883 8a9.864 9.864 0 01-4.601-1.139L3 21l2.139-3.516C4.381 16.275 4 14.193 4 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{chat.title}</p>
                            <p className="text-xs text-gray-400">{chat.date}</p>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu Button */}
            <div className="flex-shrink-0 px-4 pb-4">
              <MenuButton />
            </div>

            {/* User Profile Section */}
            <div className="flex-shrink-0 p-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Sign out"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex h-screen bg-gray-900 text-white  flex-col transition-all duration-300 ease-in-out overflow-scroll overflow-x-clip no-scrollbar ${
          isCollapsed ? 'w-16' : 'w-80'
        }`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        {/* Logo Section */}
        <div className="flex-shrink-0 p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            {!isCollapsed && <h1 className="text-xl font-semibold">ChatGPT Clone</h1>}
          </div>
        </div>

        {/* New Chat Button */}
        <div className="flex-shrink-0 p-4">
          <button
            onClick={handleNewChat}
            className={`w-full bg-gray-700 hover:bg-gray-600 text-white ${isCollapsed ? "py-2" : "py-2 px-4"} rounded-lg flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} transition-colors`}
            title={isCollapsed ? 'New Chat' : ''}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Chat History - Scrollable */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto min-h-0 px-4 modern-scrollbar">
            <h2 className="text-sm font-medium text-gray-400 mb-3">Recent Chats</h2>
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{chat.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{chat.date}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed Chat History - Show only icons */}
        {isCollapsed && (
          <div className="flex-1 overflow-y-auto min-h-0 px-2 py-4 my-2 no-scrollbar">
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className="w-full p-2 rounded-lg hover:bg-gray-800 transition-colors flex justify-center"
                  title={chat.title}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.883 8a9.864 9.864 0 01-4.601-1.139L3 21l2.139-3.516C4.381 16.275 4 14.193 4 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Button */}

        {/* User Profile Section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700 sticky bottom-0 bg-gray-900">
          <div className="flex-shrink-0 pb-4">
            <MenuButton isCollapsed={isCollapsed} />
          </div>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center space-x-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={() => signOut()}
                className="text-gray-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
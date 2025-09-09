'use client'

import { useModal } from "@/contexts/ModalContext"
import { useRouter, usePathname } from "next/navigation"

export default function ConfirmationModal() {
  const { confirmationAlert, hideConfirmation, confirmAction } = useModal()
  const router = useRouter()
  const pathname = usePathname()

  if (!confirmationAlert.isOpen) return null

  const handleConfirm = () => {
    const chatId = confirmationAlert.chatId
    confirmAction()
    
    // If user is currently viewing the deleted chat, redirect to main chat page
    if (chatId && pathname === `/chat/${chatId}`) {
      router.push('/chat')
    }
  }

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete Chat
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {confirmationAlert.message}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={hideConfirmation}
            className="flex-1 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 border border-transparent rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

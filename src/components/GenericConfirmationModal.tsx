'use client'

import { useState } from "react"

interface GenericConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

export default function GenericConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary'
}: GenericConfirmationModalProps) {
  const [Loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    try{
      setLoading(true)
      await onConfirm()
      onClose()
    } catch (error) {
      alert(`Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const iconColor = variant === 'danger' ? 'text-red-600' : 'text-blue-600'
  const bgColor = variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
  const buttonColor = variant === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className={`flex-shrink-0 w-10 h-10 mx-auto ${bgColor} rounded-full flex items-center justify-center`}>
            {variant === 'danger' ? (
              <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {message}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
          disabled={Loading}
            onClick={onClose}
            className="flex-1 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            disabled={Loading}
            onClick={handleConfirm}
            className={`flex-1 ${buttonColor} text-white rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
          >
            {Loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
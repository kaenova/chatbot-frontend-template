'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ConfirmationAlert {
  isOpen: boolean
  chatId: string | null
  chatTitle: string
  message: string
  onConfirm?: () => void
}

interface ModalContextType {
  confirmationAlert: ConfirmationAlert
  showConfirmation: (options: {
    chatId: string
    chatTitle: string
    message: string
    onConfirm: () => void
  }) => void
  hideConfirmation: () => void
  confirmAction: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

interface ModalProviderProps {
  children: ReactNode
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [confirmationAlert, setConfirmationAlert] = useState<ConfirmationAlert>({
    isOpen: false,
    chatId: null,
    chatTitle: '',
    message: '',
    onConfirm: undefined
  })

  const showConfirmation = (options: {
    chatId: string
    chatTitle: string
    message: string
    onConfirm: () => void
  }) => {
    setConfirmationAlert({
      isOpen: true,
      chatId: options.chatId,
      chatTitle: options.chatTitle,
      message: options.message,
      onConfirm: options.onConfirm
    })
  }

  const hideConfirmation = () => {
    setConfirmationAlert({
      isOpen: false,
      chatId: null,
      chatTitle: '',
      message: '',
      onConfirm: undefined
    })
  }

  const confirmAction = () => {
    if (confirmationAlert.onConfirm) {
      confirmationAlert.onConfirm()
    }
    hideConfirmation()
  }

  return (
    <ModalContext.Provider value={{
      confirmationAlert,
      showConfirmation,
      hideConfirmation,
      confirmAction
    }}>
      {children}
    </ModalContext.Provider>
  )
}

"use client"

import { useState, createContext, useContext, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ErrorNotification {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ErrorContextType {
  showError: (notification: Omit<ErrorNotification, 'id'>) => void
  showSuccess: (title: string, message: string, duration?: number) => void
  showWarning: (title: string, message: string, duration?: number) => void
  showInfo: (title: string, message: string, duration?: number) => void
  dismissNotification: (id: string) => void
  clearAll: () => void
}

const ErrorContext = createContext<ErrorContextType | null>(null)

export function useErrorNotification() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useErrorNotification must be used within an ErrorNotificationProvider')
  }
  return context
}

export function ErrorNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([])

  const showError = (notification: Omit<ErrorNotification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: ErrorNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    }
    
    setNotifications(prev => [...prev, newNotification])

    // Auto-dismiss after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id)
      }, newNotification.duration)
    }
  }

  const showSuccess = (title: string, message: string, duration = 4000) => {
    showError({ type: 'success', title, message, duration })
  }

  const showWarning = (title: string, message: string, duration = 5000) => {
    showError({ type: 'warning', title, message, duration })
  }

  const showInfo = (title: string, message: string, duration = 4000) => {
    showError({ type: 'info', title, message, duration })
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const contextValue: ErrorContextType = {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    dismissNotification,
    clearAll
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      <ErrorNotificationContainer notifications={notifications} onDismiss={dismissNotification} />
    </ErrorContext.Provider>
  )
}

function ErrorNotificationContainer({ 
  notifications, 
  onDismiss 
}: { 
  notifications: ErrorNotification[]
  onDismiss: (id: string) => void 
}) {
  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function NotificationItem({ 
  notification, 
  onDismiss 
}: { 
  notification: ErrorNotification
  onDismiss: (id: string) => void 
}) {
  const [isHovered, setIsHovered] = useState(false)

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: '✅',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700'
        }
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700'
        }
      case 'error':
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: '❌',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        ${styles.bg} ${styles.border} border rounded-xl shadow-lg p-4 cursor-pointer
        hover:shadow-xl transition-shadow duration-200
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onDismiss(notification.id)}
    >
      <div className="flex items-start space-x-3">
        <div className={`${styles.iconBg} rounded-full p-1 flex-shrink-0`}>
          <span className="text-sm">{styles.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`${styles.title} font-semibold text-sm`}>
            {notification.title}
          </h4>
          <p className={`${styles.message} text-sm mt-1 leading-relaxed`}>
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                notification.action!.onClick()
                onDismiss(notification.id)
              }}
              className={`${styles.iconColor} text-sm font-medium mt-2 hover:underline`}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDismiss(notification.id)
          }}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
        >
          <span className="text-xs">✕</span>
        </button>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {notification.duration && notification.duration > 0 && !isHovered && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: notification.duration / 1000, ease: "linear" }}
            className={`h-1 rounded-full ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'warning' ? 'bg-yellow-500' :
              notification.type === 'info' ? 'bg-blue-500' :
              'bg-red-500'
            }`}
          />
        </div>
      )}
    </motion.div>
  )
}

// Helper hook for API error handling
export function useApiErrorHandler() {
  const { showError, showSuccess } = useErrorNotification()

  const handleApiError = (error: unknown, context?: string) => {
    let title = "Error"
    let message = "An unexpected error occurred"

    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>
      
      if (errorObj.error && typeof errorObj.error === 'object') {
        const error = errorObj.error as Record<string, unknown>
        title = error.type && typeof error.type === 'string' ? error.type.replace('_', ' ') : "Error"
        message = error.message && typeof error.message === 'string' ? error.message : message
      } else if (errorObj.message && typeof errorObj.message === 'string') {
        message = errorObj.message
      }
    } else if (typeof error === 'string') {
      message = error
    }

    if (context) {
      title = `${context} Error`
    }

    showError({
      type: 'error',
      title,
      message,
      duration: 6000
    })
  }

  const handleApiSuccess = (message: string, title = "Success") => {
    showSuccess(title, message)
  }

  return {
    handleApiError,
    handleApiSuccess,
    showError,
    showSuccess
  }
}
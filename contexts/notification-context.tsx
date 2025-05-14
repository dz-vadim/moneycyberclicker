"use client"

import { createContext, useContext, type ReactNode, useState, useCallback } from "react"

// Типи для сповіщень
export type NotificationType = "info" | "success" | "warning" | "error"

export interface Notification {
  id: string
  message: string
  type: NotificationType
  duration?: number
}

// Контекст сповіщень
interface NotificationContextType {
  notifications: Notification[]
  addNotification: (message: string, type: NotificationType, duration?: number) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Провайдер сповіщень
interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Змінюємо функцію addNotification, щоб вона була мемоізована і не створювалася заново при кожному рендері
  // Також переконаємося, що removeNotification також мемоізована

  const addNotification = useCallback((message: string, type: NotificationType = "info", duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setNotifications((prev) => [...prev, { id, message, type, duration }])

    // Автоматично видаляємо сповіщення після певного часу
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }, []) // Видаляємо removeNotification з залежностей, щоб уникнути циклічної залежності

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

// Хук для використання сповіщень
export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }

  return context
}

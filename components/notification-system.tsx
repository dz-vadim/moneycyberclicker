"use client"

import type React from "react"

import { useState, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

// Types
type NotificationType = "info" | "success" | "warning" | "error" | "confirm"

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
  onConfirm?: () => void
  onCancel?: () => void
}

interface NotificationContextType {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, "id">) => void
  hideNotification: (id: string) => void
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void
}

// Create context
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  showNotification: () => {},
  hideNotification: () => {},
  showConfirm: () => {},
})

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newNotification = { ...notification, id }
    setNotifications((prev) => [...prev, newNotification])

    // Auto-hide notification after duration (if provided)
    if (notification.duration && notification.type !== "confirm") {
      setTimeout(() => {
        hideNotification(id)
      }, notification.duration)
    }

    return id
  }

  const hideNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const showConfirm = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    showNotification({
      type: "confirm",
      message,
      onConfirm,
      onCancel,
    })
  }

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification, showConfirm }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Hook to use notifications
export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

// Container component to display notifications
function NotificationContainer() {
  const { notifications, hideNotification } = useContext(NotificationContext)

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-sm border-2 bg-black/90 p-4 shadow-lg"
            style={{
              borderColor:
                notification.type === "success"
                  ? "#39ff14"
                  : notification.type === "error"
                    ? "#ff2a6d"
                    : notification.type === "warning"
                      ? "#f9f871"
                      : notification.type === "confirm"
                        ? "#05d9e8"
                        : "#05d9e8",
              boxShadow:
                notification.type === "success"
                  ? "0 0 10px rgba(57, 255, 20, 0.5)"
                  : notification.type === "error"
                    ? "0 0 10px rgba(255, 42, 109, 0.5)"
                    : notification.type === "warning"
                      ? "0 0 10px rgba(249, 248, 113, 0.5)"
                      : notification.type === "confirm"
                        ? "0 0 10px rgba(5, 217, 232, 0.5)"
                        : "0 0 10px rgba(5, 217, 232, 0.5)",
            }}
          >
            {notification.type !== "confirm" && (
              <button
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
                onClick={() => hideNotification(notification.id)}
              >
                <X size={16} />
              </button>
            )}

            <div
              className="mb-2 text-sm"
              style={{
                color:
                  notification.type === "success"
                    ? "#39ff14"
                    : notification.type === "error"
                      ? "#ff2a6d"
                      : notification.type === "warning"
                        ? "#f9f871"
                        : notification.type === "confirm"
                          ? "#05d9e8"
                          : "#05d9e8",
              }}
            >
              {notification.message}
            </div>

            {notification.type === "confirm" && (
              <div className="flex justify-end gap-2 mt-4">
                {notification.onCancel && (
                  <button
                    className="px-3 py-1 text-xs rounded-sm border"
                    style={{ borderColor: "#ff2a6d", color: "#ff2a6d" }}
                    onClick={() => {
                      notification.onCancel?.()
                      hideNotification(notification.id)
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  className="px-3 py-1 text-xs rounded-sm border"
                  style={{ borderColor: "#39ff14", color: "#39ff14" }}
                  onClick={() => {
                    notification.onConfirm?.()
                    hideNotification(notification.id)
                  }}
                >
                  Confirm
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Додаємо експорт за замовчуванням для NotificationProvider
export default NotificationProvider

// Додаємо компонент NotificationSystem, який використовується в app/page.tsx
export function NotificationSystem() {
  // Цей компонент просто використовує NotificationContainer через контекст
  // і не потребує ніяких додаткових властивостей
  return <NotificationContainer />
}

"use client"

import { useNotification as useNotificationContext } from "@/contexts/notification-context"
import { useTranslation } from "@/utils/i18n"
import { useCallback } from "react"

export const useNotification = () => {
  const { addNotification, removeNotification, notifications } = useNotificationContext()
  const { t } = useTranslation()

  const showSuccess = useCallback(
    (key: string, duration = 5000) => {
      addNotification(t(key), "success", duration)
    },
    [addNotification, t],
  )

  const showError = useCallback(
    (key: string, duration = 5000) => {
      addNotification(t(key), "error", duration)
    },
    [addNotification, t],
  )

  const showInfo = useCallback(
    (key: string, duration = 5000) => {
      addNotification(t(key), "info", duration)
    },
    [addNotification, t],
  )

  const showWarning = useCallback(
    (key: string, duration = 5000) => {
      addNotification(t(key), "warning", duration)
    },
    [addNotification, t],
  )

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification,
    notifications,
  }
}

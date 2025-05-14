import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
// Змінюємо імпорт на дефолтний
import NotificationProvider from "@/components/notification-system"
import { I18nProvider } from "@/utils/i18n"

export const metadata = {
  generator: 'v0dev'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Cyber Clicker</title>
        <meta name="description" content="A cyberpunk-themed clicker game" />
      </head>
      <body>
        <I18nProvider>
          <ThemeProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}

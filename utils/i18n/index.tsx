"use client"

import type React from "react"

import { createContext, useContext, type ReactNode, useState, useEffect } from "react"
import { translations as commonTranslations } from "./translations"
import { uiTranslations } from "./ui-translations"
import { upgradeTranslations } from "./upgrade-translations"
import { skinTranslations } from "./skin-translations"
import { effectTranslations } from "./effect-translations"
import { adminTranslations } from "./admin-translations"
import { docTranslations } from "./doc-translations"

export type Language = "en" | "uk"
export type TranslationKey = string

// Combine all translations
const allTranslations = {
  ...commonTranslations,
  ...uiTranslations,
  ...upgradeTranslations,
  ...skinTranslations,
  ...effectTranslations,
  ...adminTranslations,
  ...docTranslations,
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  availableLanguages: Language[]
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const useTranslation = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider")
  }
  return context
}

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "uk")) {
      setLanguageState(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0]
      if (browserLang === "uk") {
        setLanguageState("uk")
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = allTranslations[key as keyof typeof allTranslations]

    if (!translation) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }

    let text = translation[language] || translation.en || key

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`{{${paramKey}}}`, "g"), String(paramValue))
      })
    }

    return text
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        availableLanguages: ["en", "uk"],
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

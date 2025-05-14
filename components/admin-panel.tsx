"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { X, Save, Trash2, Download, Upload, Key, Eye, EyeOff, RefreshCw } from "lucide-react"
import CyberCard from "./cyber-card"
import CyberButton from "./cyber-button"
import type { Language } from "@/utils/language"
import { useTranslation } from "@/utils/i18n"
import { useNotification } from "@/hooks/use-notification"
import GameDocumentation from "@/docs/game-documentation"

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
  gameState: any
  onUpdateGameState: (newState: any) => void
  onResetGame: () => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}

export default function AdminPanel({
  isOpen,
  onClose,
  gameState,
  onUpdateGameState,
  onResetGame,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"general" | "upgrades" | "skins" | "cases" | "effects" | "docs">("general")
  const [editedState, setEditedState] = useState<any>(null) // Змінено на null для початкового стану
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")
  const [showImportExport, setShowImportExport] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false) // Додано для відстеження ініціалізації

  const { t } = useTranslation("admin")
  const { showSuccess, showError } = useNotification()

  // Спрощена функція клонування без рекурсії
  const safeClone = useCallback((obj: any) => {
    if (!obj || typeof obj !== "object") return obj

    try {
      // Спробуємо використати структуроване клонування для простих об'єктів
      // Це не працює для циклічних посилань, але ми обробимо помилку
      return structuredClone(obj)
    } catch (e) {
      // Якщо структуроване клонування не працює, використовуємо ручне клонування
      try {
        // Спробуємо створити простий об'єкт без методів і складних властивостей
        const simpleObj: any = Array.isArray(obj) ? [] : {}

        // Обмежимо глибину обходу для запобігання переповненню стеку
        const MAX_DEPTH = 5

        function cloneLevel(source: any, target: any, currentDepth: number) {
          if (currentDepth > MAX_DEPTH) return

          Object.keys(source).forEach((key) => {
            // Пропускаємо функції, символи та спеціальні властивості React
            if (
              typeof source[key] === "function" ||
              typeof source[key] === "symbol" ||
              key === "_owner" ||
              key === "ref" ||
              key === "_self" ||
              key === "_source" ||
              key === "Provider" ||
              key === "_context" ||
              key === "context"
            ) {
              return
            }

            // Для простих типів просто копіюємо значення
            if (source[key] === null || typeof source[key] !== "object") {
              target[key] = source[key]
              return
            }

            // Для об'єктів і масивів створюємо нові і рекурсивно клонуємо
            target[key] = Array.isArray(source[key]) ? [] : {}
            cloneLevel(source[key], target[key], currentDepth + 1)
          })
        }

        cloneLevel(obj, simpleObj, 0)
        return simpleObj
      } catch (err) {
        console.error("Failed to clone object:", err)
        // Повертаємо порожній об'єкт у випадку помилки
        return Array.isArray(obj) ? [] : {}
      }
    }
  }, [])

  // Ініціалізуємо editedState лише один раз при монтуванні
  useEffect(() => {
    if (gameState && !isInitialized) {
      try {
        const clonedState = safeClone(gameState)
        setEditedState(clonedState)
        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing state:", error)
        setEditedState({})
        setIsInitialized(true)
      }
    }
  }, [gameState, isInitialized, safeClone]) // Видалили safeSetEditedState з залежностей

  // Аутентифікація
  const authenticate = useCallback(() => {
    // В реальному додатку тут має бути справжня перевірка пароля
    // Для демонстрації використовуємо простий пароль "admin123"
    if (adminPassword === "admin123") {
      setIsAuthenticated(true)
      localStorage.setItem("admin_authenticated", "true")
      showSuccess("loginSuccess")
    } else {
      showError("incorrectPassword")
    }
  }, [adminPassword, showSuccess, showError])

  // Перевіряємо збережену аутентифікацію при завантаженні
  useEffect(() => {
    const savedAuth = localStorage.getItem("admin_authenticated")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  // Вихід з адмін-панелі
  const logout = useCallback(() => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_authenticated")
    onClose()
    showSuccess("loggedOut")
  }, [onClose, showSuccess])

  // Обробники змін
  const handleGeneralChange = useCallback((key: string, value: any) => {
    setEditedState((prev: any) => {
      if (!prev) return prev
      if (key === "") return value // Для випадку, коли передаємо повністю новий стан
      return {
        ...prev,
        [key]: value,
      }
    })
  }, [])

  const handleUpgradeChange = useCallback((upgradeId: string, field: string, value: any) => {
    setEditedState((prev: any) => {
      if (!prev || !prev.upgrades) return prev
      return {
        ...prev,
        upgrades: {
          ...prev.upgrades,
          [upgradeId]: {
            ...prev.upgrades[upgradeId],
            [field]: value,
          },
        },
      }
    })
  }, [])

  const handleSkinChange = useCallback((skinId: string, field: string, value: any) => {
    setEditedState((prev: any) => {
      if (!prev || !prev.skins) return prev
      return {
        ...prev,
        skins: {
          ...prev.skins,
          [skinId]: {
            ...prev.skins[skinId],
            [field]: field === "colors" ? { ...prev.skins[skinId].colors, ...value } : value,
          },
        },
      }
    })
  }, [])

  // Збереження змін
  const saveChanges = useCallback(() => {
    if (editedState) {
      onUpdateGameState(editedState)
      showSuccess("changesSaved")
    }
  }, [editedState, onUpdateGameState, showSuccess])

  const exportGameData = useCallback(() => {
    try {
      // Створюємо спрощену версію стану для експорту
      const exportableState = safeClone(gameState)

      // Видаляємо всі функції та складні об'єкти
      const cleanForExport = (obj: any) => {
        if (!obj || typeof obj !== "object") return obj

        const cleaned: any = Array.isArray(obj) ? [] : {}

        Object.keys(obj).forEach((key) => {
          if (typeof obj[key] === "function") return
          if (typeof obj[key] === "object" && obj[key] !== null) {
            cleaned[key] = cleanForExport(obj[key])
          } else {
            cleaned[key] = obj[key]
          }
        })

        return cleaned
      }

      const cleanedState = cleanForExport(exportableState)
      const dataStr = JSON.stringify(cleanedState, null, 2)
      setExportData(dataStr)
      setShowImportExport(true)
    } catch (error) {
      console.error("Export error:", error)
      showError("errorExportingData")
    }
  }, [gameState, safeClone, showError])

  const importGameData = useCallback(() => {
    try {
      const newData = JSON.parse(importData)
      onUpdateGameState(newData)
      setShowImportExport(false)
      setImportData("")
      showSuccess("dataImported")
    } catch (error) {
      console.error("Import error:", error)
      showError("errorImportingData")
    }
  }, [importData, onUpdateGameState, showSuccess, showError])

  // Якщо панель закрита, не рендеримо нічого
  if (!isOpen) return null

  // Якщо editedState ще не ініціалізовано, показуємо завантаження
  if (!editedState) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-white">Loading...</div>
      </motion.div>
    )
  }

  // Якщо не аутентифіковано, показуємо форму входу
  if (!isAuthenticated) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
              {t("adminPanel")}
            </h2>
            <button className="p-2 rounded-sm hover:bg-black/20" onClick={onClose} style={{ color: secondaryColor }}>
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm" style={{ color: secondaryColor }}>
                {t("password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-2 bg-black/30 border rounded-sm"
                  style={{ borderColor: secondaryColor, color: primaryColor }}
                />
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: secondaryColor }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <CyberButton onClick={authenticate} primaryColor={primaryColor} secondaryColor={secondaryColor}>
                {t("login")}
              </CyberButton>
            </div>
          </div>
        </CyberCard>
      </motion.div>
    )
  }

  const handleInputChange = (field: string, value: any) => {
    // Для числових полів перетворюємо рядок на число
    let parsedValue = value

    // Перевіряємо, чи поле має бути числовим
    if (
      ["money", "totalEarned", "clickCount", "moneyPerClick", "robocoins", "totalRobocoins", "prestigeCount"].includes(
        field,
      )
    ) {
      // Дозволяємо вводити тільки цифри та крапку
      if ((typeof value === "string" && /^[0-9]*\.?[0-9]*$/.test(value)) || value === "") {
        // Якщо поле порожнє, встановлюємо 0
        parsedValue = value === "" ? 0 : Number.parseFloat(value)
      }
    }

    setEditedState((prev) => ({
      ...prev,
      [field]: parsedValue,
    }))
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="w-full h-full max-w-7xl max-h-[90vh] flex flex-col rounded-sm border-2 bg-black/95 overflow-hidden"
        style={{
          borderColor: primaryColor,
          boxShadow: `0 0 20px ${primaryColor}80`,
        }}
      >
        {/* Заголовок */}
        <div
          className="flex justify-between items-center p-4 border-b-2"
          style={{ borderColor: `${secondaryColor}40` }}
        >
          <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
            {t("adminPanel")} Cyber Clicker
          </h2>
          <div className="flex gap-2">
            <CyberButton onClick={exportGameData} primaryColor={accentColor} className="text-sm py-1">
              <Download size={16} className="mr-1" />
              {t("export")}
            </CyberButton>
            <CyberButton
              onClick={() => setShowImportExport(true)}
              primaryColor={secondaryColor}
              className="text-sm py-1"
            >
              <Upload size={16} className="mr-1" />
              {t("import")}
            </CyberButton>
            <CyberButton onClick={saveChanges} primaryColor={primaryColor} className="text-sm py-1">
              <Save size={16} className="mr-1" />
              {t("save")}
            </CyberButton>
            <button className="p-2 rounded-sm hover:bg-black/20" onClick={logout} style={{ color: secondaryColor }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Навігація */}
        <div className="flex border-b-2" style={{ borderColor: `${secondaryColor}40` }}>
          {["general", "upgrades", "skins", "cases", "effects", "docs"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-bold uppercase transition-all border-b-2 ${
                activeTab === tab ? "border-opacity-100" : "border-opacity-0 hover:border-opacity-50"
              }`}
              style={{
                borderColor: primaryColor,
                color: activeTab === tab ? primaryColor : secondaryColor,
              }}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab === "general"
                ? t("general")
                : tab === "upgrades"
                  ? t("upgrades")
                  : tab === "skins"
                    ? t("skins")
                    : tab === "cases"
                      ? t("cases")
                      : tab === "effects"
                        ? t("effects")
                        : t("docs")}
            </button>
          ))}
        </div>

        {/* Вміст */}
        <div className="flex-1 overflow-auto p-4 cyber-scrollbar">
          {activeTab === "general" && (
            <GeneralSettings
              state={editedState}
              onChange={handleGeneralChange}
              onReset={() => setShowConfirmReset(true)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}

          {activeTab === "upgrades" && (
            <UpgradesSettings
              upgrades={editedState.upgrades}
              onChange={handleUpgradeChange}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}

          {activeTab === "skins" && (
            <SkinsSettings
              skins={editedState.skins}
              onChange={handleSkinChange}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}

          {activeTab === "cases" && (
            <CasesSettings
              unlockedCases={editedState.unlockedCases}
              onChange={(cases) => handleGeneralChange("unlockedCases", cases)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}

          {activeTab === "effects" && (
            <EffectsSettings
              clickEffects={editedState.clickEffects || []}
              visualEffects={editedState.visualEffects || []}
              bonusEffects={editedState.bonusEffects || []}
              specialEffects={editedState.specialEffects || []}
              onChange={(type, effects) => handleGeneralChange(`${type}Effects`, effects)}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}

          {activeTab === "docs" && (
            <Documentation
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              language={language}
            />
          )}
        </div>
      </div>

      {/* Модальне вікно підтвердження скидання */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
              {t("resetConfirm")}
            </h3>
            <p className="mb-6" style={{ color: secondaryColor }}>
              {t("resetConfirm")}
            </p>
            <div className="flex justify-end gap-4">
              <CyberButton onClick={() => setShowConfirmReset(false)} primaryColor={secondaryColor}>
                {t("cancel")}
              </CyberButton>
              <CyberButton
                onClick={() => {
                  onResetGame()
                  setShowConfirmReset(false)
                  showSuccess("gameDataReset")
                }}
                primaryColor="#ff0000"
              >
                <Trash2 size={16} className="mr-2" />
                {t("reset")}
              </CyberButton>
            </div>
          </CyberCard>
        </div>
      )}

      {/* Модальне вікно імпорту/експорту */}
      {showImportExport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
                {t("import")}/{t("export")} {t("general")}
              </h3>
              <button
                className="p-2 rounded-sm hover:bg-black/20"
                onClick={() => setShowImportExport(false)}
                style={{ color: secondaryColor }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-2" style={{ color: secondaryColor }}>
                {t("general")} JSON
              </label>
              <textarea
                value={exportData || importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full h-64 p-2 bg-black/30 border rounded-sm font-mono text-sm cyber-scrollbar"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>

            <div className="flex justify-end gap-4">
              <CyberButton onClick={() => setShowImportExport(false)} primaryColor={secondaryColor}>
                {t("cancel")}
              </CyberButton>
              <CyberButton onClick={importGameData} primaryColor={primaryColor}>
                <Upload size={16} className="mr-2" />
                {t("import")}
              </CyberButton>
            </div>
          </CyberCard>
        </div>
      )}
    </motion.div>
  )
}

// Компонент загальних налаштувань
function GeneralSettings({
  state,
  onChange,
  onReset,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  state: any
  onChange: (key: string, value: any) => void
  onReset: () => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  const { t } = useTranslation("admin")
  const [moneyValue, setMoneyValue] = useState(state.money?.toString() || "0")
  const [totalEarnedValue, setTotalEarnedValue] = useState(state.totalEarned?.toString() || "0")

  // Оновлюємо локальні стани при зміні props
  useEffect(() => {
    setMoneyValue(state.money?.toString() || "0")
    setTotalEarnedValue(state.totalEarned?.toString() || "0")
  }, [state.money, state.totalEarned])

  // Обробники для полів вводу
  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMoneyValue(value)
    if (value.trim() !== "") {
      onChange("money", Number(value))
    }
  }

  const handleTotalEarnedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTotalEarnedValue(value)
    if (value.trim() !== "") {
      onChange("totalEarned", Number(value))
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
        {t("general")} {t("general")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t("gameEconomy")}
          </h4>

          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                {t("admin.money")}:
              </label>
              <input
                type="text"
                value={state.money}
                onChange={(e) => onChange("money", e.target.value)}
                className="w-full p-2 bg-black/50 border rounded"
                style={{ borderColor: primaryColor, color: primaryColor }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: secondaryColor }}>
                {t("admin.totalEarned")}:
              </label>
              <input
                type="text"
                value={state.totalEarned}
                onChange={(e) => onChange("totalEarned", e.target.value)}
                className="w-full p-2 bg-black/50 border rounded"
                style={{ borderColor: primaryColor, color: primaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t("clickCount")}
              </label>
              <input
                type="number"
                value={state.clickCount}
                onChange={(e) => onChange("clickCount", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t("moneyPerClick")}
              </label>
              <input
                type="number"
                value={state.moneyPerClick}
                onChange={(e) => onChange("moneyPerClick", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>
          </div>
        </CyberCard>

        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t("prestigeAndBonuses")}
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t("robocoins")}
              </label>
              <input
                type="number"
                value={state.robocoins}
                onChange={(e) => onChange("robocoins", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t("totalRobocoins")}
              </label>
              <input
                type="number"
                value={state.totalRobocoins}
                onChange={(e) => onChange("totalRobocoins", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t("prestigeCount")}
              </label>
              <input
                type="number"
                value={state.prestigeCount}
                onChange={(e) => onChange("prestigeCount", Number(e.target.value))}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t("playerName")}
              </label>
              <input
                type="text"
                value={state.playerName}
                onChange={(e) => onChange("playerName", e.target.value)}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              />
            </div>
          </div>
        </CyberCard>

        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t("interfaceSettings")}
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t("activeSkin")}
              </label>
              <select
                value={state.activeSkin}
                onChange={(e) => onChange("activeSkin", e.target.value)}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              >
                {Object.keys(state.skins || {}).map((skinId) => (
                  <option key={skinId} value={skinId}>
                    {skinId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                {t("language")}
              </label>
              <select
                value={state.language}
                onChange={(e) => onChange("language", e.target.value)}
                className="w-full p-2 bg-black/30 border rounded-sm"
                style={{ borderColor: secondaryColor, color: primaryColor }}
              >
                <option value="en">English</option>
                <option value="uk">Українська</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={state.musicEnabled}
                onChange={(e) => onChange("musicEnabled", e.target.checked)}
                id="musicEnabled"
                className="mr-2"
              />
              <label htmlFor="musicEnabled" style={{ color: secondaryColor }}>
                {t("musicEnabled")}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={state.useDesktopInterface}
                onChange={(e) => onChange("useDesktopInterface", e.target.checked)}
                id="useDesktopInterface"
                className="mr-2"
              />
              <label htmlFor="useDesktopInterface" style={{ color: secondaryColor }}>
                {t("useDesktopInterface")}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={state.desktopInterfaceUnlocked}
                onChange={(e) => onChange("desktopInterfaceUnlocked", e.target.checked)}
                id="desktopInterfaceUnlocked"
                className="mr-2"
              />
              <label htmlFor="desktopInterfaceUnlocked" style={{ color: secondaryColor }}>
                {t("desktopInterfaceUnlocked")}
              </label>
            </div>
          </div>
        </CyberCard>

        <CyberCard primaryColor="#ff0000" secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: "#ff0000" }}>
            {t("dangerZone")}
          </h4>

          <div className="space-y-4">
            <p style={{ color: secondaryColor }}>{t("dangerWarning")}</p>

            <div className="flex justify-between">
              <CyberButton onClick={onReset} primaryColor="#ff0000">
                <Trash2 size={16} className="mr-2" />
                {t("resetAllData")}
              </CyberButton>

              <CyberButton
                onClick={() => {
                  const newState = { ...state }
                  // Розблокувати всі скіни
                  Object.keys(newState.skins).forEach((skinId) => {
                    newState.skins[skinId].owned = true
                  })
                  // Розблокувати всі кейси
                  newState.unlockedCases = ["basic", "premium", "elite", "legendary"]
                  // Розблокувати десктопний інтерфейс
                  newState.desktopInterfaceUnlocked = true
                  onChange("", newState)
                }}
                primaryColor={accentColor}
              >
                <Key size={16} className="mr-2" />
                {t("unlockAll")}
              </CyberButton>
            </div>

            <div className="flex justify-between">
              <CyberButton
                onClick={() => {
                  const newState = { ...state }
                  // Максимальні рівні покращень
                  Object.keys(newState.upgrades).forEach((upgradeId) => {
                    newState.upgrades[upgradeId].level = 100
                    newState.upgrades[upgradeId].owned = true
                  })
                  onChange("", newState)
                }}
                primaryColor={accentColor}
              >
                <RefreshCw size={16} className="mr-2" />
                {t("maxUpgrades")}
              </CyberButton>

              <CyberButton
                onClick={() => {
                  onChange("money", 1000000000)
                  onChange("totalEarned", 1000000000)
                }}
                primaryColor={accentColor}
              >
                <RefreshCw size={16} className="mr-2" />
                {t("addMoney")}
              </CyberButton>
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
  )
}

// Компонент налаштувань покращень
function UpgradesSettings({
  upgrades,
  onChange,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  upgrades: Record<string, any>
  onChange: (upgradeId: string, field: string, value: any) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  const [filter, setFilter] = useState<"all" | "basic" | "advanced" | "special">("all")
  const { t } = useTranslation("admin")

  const filteredUpgrades = Object.entries(upgrades).filter(([_, upgrade]) => {
    if (filter === "all") return true
    return upgrade.category === filter
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
          {t("upgradeSettings")}
        </h3>

        <div className="flex gap-2">
          {["all", "basic", "advanced", "special"].map((category) => (
            <button
              key={category}
              className={`px-3 py-1 text-sm rounded-sm border ${
                filter === category ? "border-opacity-100" : "border-opacity-50"
              }`}
              style={{
                borderColor: primaryColor,
                color: filter === category ? primaryColor : secondaryColor,
                backgroundColor: filter === category ? `${primaryColor}20` : "transparent",
              }}
              onClick={() => setFilter(category as any)}
            >
              {category === "all"
                ? t("all")
                : category === "basic"
                  ? t("basic")
                  : category === "advanced"
                    ? t("advanced")
                    : t("special")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUpgrades.map(([upgradeId, upgrade]) => (
          <CyberCard key={upgradeId} primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
            <h4 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
              {upgrade.name} ({upgradeId})
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                  {t("description")}
                </label>
                <input
                  type="text"
                  value={upgrade.description}
                  onChange={(e) => onChange(upgradeId, "description", e.target.value)}
                  className="w-full p-2 bg-black/30 border rounded-sm"
                  style={{ borderColor: secondaryColor, color: primaryColor }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t("level")}
                  </label>
                  <input
                    type="number"
                    value={upgrade.level}
                    onChange={(e) => onChange(upgradeId, "level", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t("baseCost")}
                  </label>
                  <input
                    type="number"
                    value={upgrade.baseCost}
                    onChange={(e) => onChange(upgradeId, "baseCost", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t("costMultiplier")}
                  </label>
                  <input
                    type="number"
                    value={upgrade.costMultiplier}
                    onChange={(e) => onChange(upgradeId, "costMultiplier", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t("effect")}
                  </label>
                  <input
                    type="number"
                    value={upgrade.effect}
                    onChange={(e) => onChange(upgradeId, "effect", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t("effectMultiplier")}
                  </label>
                  <input
                    type="number"
                    value={upgrade.effectMultiplier}
                    onChange={(e) => onChange(upgradeId, "effectMultiplier", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: secondaryColor }}>
                    {t("category")}
                  </label>
                  <select
                    value={upgrade.category}
                    onChange={(e) => onChange(upgradeId, "category", e.target.value)}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: secondaryColor, color: primaryColor }}
                  >
                    <option value="basic">{t("basic")}</option>
                    <option value="advanced">{t("advanced")}</option>
                    <option value="special">{t("special")}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={upgrade.owned}
                  onChange={(e) => onChange(upgradeId, "owned", e.target.checked)}
                  id={`owned-${upgradeId}`}
                  className="mr-2"
                />
                <label htmlFor={`owned-${upgradeId}`} style={{ color: secondaryColor }}>
                  {t("owned")}
                </label>
              </div>
            </div>
          </CyberCard>
        ))}
      </div>
    </div>
  )
}

// Компонент налаштувань скінів
function SkinsSettings({
  skins,
  onChange,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  skins: Record<string, any>
  onChange: (skinId: string, field: string, value: any) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  const { t } = useTranslation("admin")

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
        {t("skinSettings")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(skins).map(([skinId, skin]) => (
          <CyberCard
            key={skinId}
            primaryColor={skin.colors.primary}
            secondaryColor={skin.colors.secondary}
            className="p-4"
          >
            <h4 className="text-lg font-bold mb-3" style={{ color: skin.colors.primary }}>
              {skin.name} ({skinId})
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: skin.colors.secondary }}>
                  {t("name")}
                </label>
                <input
                  type="text"
                  value={skin.name}
                  onChange={(e) => onChange(skinId, "name", e.target.value)}
                  className="w-full p-2 bg-black/30 border rounded-sm"
                  style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                />
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: skin.colors.secondary }}>
                  {t("description")}
                </label>
                <input
                  type="text"
                  value={skin.description}
                  onChange={(e) => onChange(skinId, "description", e.target.value)}
                  className="w-full p-2 bg-black/30 border rounded-sm"
                  style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: skin.colors.secondary }}>
                    {t("cost")}
                  </label>
                  <input
                    type="number"
                    value={skin.cost}
                    onChange={(e) => onChange(skinId, "cost", Number(e.target.value))}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: skin.colors.secondary }}>
                    {t("requirement")}
                  </label>
                  <select
                    value={skin.unlockRequirement || ""}
                    onChange={(e) => onChange(skinId, "unlockRequirement", e.target.value || null)}
                    className="w-full p-2 bg-black/30 border rounded-sm"
                    style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                  >
                    <option value="">{t("none")}</option>
                    {Object.keys(skins).map((id) => (
                      <option key={id} value={id} disabled={id === skinId}>
                        {skins[id].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: skin.colors.secondary }}>
                  {t("colors")}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: skin.colors.secondary }}>
                      {t("primary")}
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={skin.colors.primary}
                        onChange={(e) => onChange(skinId, "colors", { primary: e.target.value })}
                        className="w-10 h-10 rounded-sm mr-2 border"
                        style={{ borderColor: skin.colors.secondary }}
                      />
                      <input
                        type="text"
                        value={skin.colors.primary}
                        onChange={(e) => onChange(skinId, "colors", { primary: e.target.value })}
                        className="flex-1 p-2 bg-black/30 border rounded-sm"
                        style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1" style={{ color: skin.colors.secondary }}>
                      {t("secondary")}
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={skin.colors.secondary}
                        onChange={(e) => onChange(skinId, "colors", { secondary: e.target.value })}
                        className="w-10 h-10 rounded-sm mr-2 border"
                        style={{ borderColor: skin.colors.secondary }}
                      />
                      <input
                        type="text"
                        value={skin.colors.secondary}
                        onChange={(e) => onChange(skinId, "colors", { secondary: e.target.value })}
                        className="flex-1 p-2 bg-black/30 border rounded-sm"
                        style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1" style={{ color: skin.colors.secondary }}>
                      {t("accent")}
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={skin.colors.accent}
                        onChange={(e) => onChange(skinId, "colors", { accent: e.target.value })}
                        className="w-10 h-10 rounded-sm mr-2 border"
                        style={{ borderColor: skin.colors.secondary }}
                      />
                      <input
                        type="text"
                        value={skin.colors.accent}
                        onChange={(e) => onChange(skinId, "colors", { accent: e.target.value })}
                        className="flex-1 p-2 bg-black/30 border rounded-sm"
                        style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1" style={{ color: skin.colors.secondary }}>
                      {t("background")}
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        value={skin.colors.background}
                        onChange={(e) => onChange(skinId, "colors", { background: e.target.value })}
                        className="w-10 h-10 rounded-sm mr-2 border"
                        style={{ borderColor: skin.colors.secondary }}
                      />
                      <input
                        type="text"
                        value={skin.colors.background}
                        onChange={(e) => onChange(skinId, "colors", { background: e.target.value })}
                        className="flex-1 p-2 bg-black/30 border rounded-sm"
                        style={{ borderColor: skin.colors.secondary, color: skin.colors.primary }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={skin.owned}
                  onChange={(e) => onChange(skinId, "owned", e.target.checked)}
                  id={`owned-${skinId}`}
                  className="mr-2"
                />
                <label htmlFor={`owned-${skinId}`} style={{ color: skin.colors.secondary }}>
                  {t("owned")}
                </label>
              </div>

              <div className="h-10 rounded-sm mt-2" style={{ backgroundColor: skin.colors.background }}>
                <div className="flex h-full justify-around items-center">
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: skin.colors.primary }}></div>
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: skin.colors.secondary }}></div>
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: skin.colors.accent }}></div>
                </div>
              </div>
            </div>
          </CyberCard>
        ))}
      </div>
    </div>
  )
}

// Компонент налаштувань кейсів
function CasesSettings({
  unlockedCases,
  onChange,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  unlockedCases: string[]
  onChange: (cases: string[]) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  const allCases = ["basic", "premium", "elite", "legendary"]
  const { t } = useTranslation("admin")

  const toggleCase = (caseId: string) => {
    if (unlockedCases.includes(caseId)) {
      onChange(unlockedCases.filter((id) => id !== caseId))
    } else {
      onChange([...unlockedCases, caseId])
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
        {t("caseSettings")}
      </h3>

      <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
        <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
          {t("unlockedCases")}
        </h4>

        <div className="space-y-3">
          {allCases.map((caseId) => (
            <div key={caseId} className="flex items-center">
              <input
                type="checkbox"
                checked={unlockedCases.includes(caseId)}
                onChange={() => toggleCase(caseId)}
                id={`case-${caseId}`}
                className="mr-2"
              />
              <label htmlFor={`case-${caseId}`} style={{ color: secondaryColor }}>
                {caseId === "basic"
                  ? t("basicCase")
                  : caseId === "premium"
                    ? t("premiumCase")
                    : caseId === "elite"
                      ? t("eliteCase")
                      : t("legendaryCase")}
              </label>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <CyberButton onClick={() => onChange([])} primaryColor={secondaryColor} className="text-sm py-1">
            {t("resetAll")}
          </CyberButton>

          <CyberButton onClick={() => onChange(allCases)} primaryColor={accentColor} className="text-sm py-1">
            {t("selectAll")}
          </CyberButton>
        </div>
      </CyberCard>

      <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
        <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
          {t("caseInfo")}
        </h4>

        <div className="space-y-4">
          <div>
            <h5 className="font-bold mb-2" style={{ color: "#05d9e8" }}>
              {t("basicCase")}
            </h5>
            <p className="text-sm" style={{ color: secondaryColor }}>
              {t("basicCaseDesc")}
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-2" style={{ color: "#ff2a6d" }}>
              {t("premiumCase")}
            </h5>
            <p className="text-sm" style={{ color: secondaryColor }}>
              {t("premiumCaseDesc")}
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-2" style={{ color: "#d300c5" }}>
              {t("eliteCase")}
            </h5>
            <p className="text-sm" style={{ color: secondaryColor }}>
              {t("eliteCaseDesc")}
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-2" style={{ color: "#39ff14" }}>
              {t("legendaryCase")}
            </h5>
            <p className="text-sm" style={{ color: secondaryColor }}>
              {t("legendaryCaseDesc")}
            </p>
          </div>
        </div>
      </CyberCard>
    </div>
  )
}

// Компонент налаштувань ефектів
function EffectsSettings({
  clickEffects,
  visualEffects,
  bonusEffects,
  specialEffects,
  onChange,
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  clickEffects: string[]
  visualEffects: string[]
  bonusEffects: string[]
  specialEffects: string[]
  onChange: (type: string, effects: string[]) => void
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  const allEffects = {
    click: [
      { id: "basic-1", name: "Pixel Dust", description: "Adds pixel particles to your clicks" },
      { id: "basic-2", name: "Echo Click", description: "Creates echo ripples when clicking" },
      { id: "premium-1", name: "Plasma Burst", description: "Explosive plasma effect on clicks" },
      { id: "premium-4", name: "Hologram Click", description: "Holographic projection on each click" },
      { id: "elite-1", name: "Quantum Particles", description: "Quantum particle effects on clicks" },
      { id: "elite-4", name: "Fractal Click", description: "Fractal patterns explode from clicks" },
      { id: "legendary-1", name: "Supernova", description: "Cosmic explosion on critical clicks" },
      { id: "legendary-4", name: "Dimensional Rift", description: "Opens rifts in reality when clicking" },
    ],
    visual: [
      { id: "basic-3", name: "Neon Glow", description: "Adds a subtle neon glow to the game" },
      { id: "basic-5", name: "Digital Rain", description: "Matrix-style digital rain in the background" },
      { id: "premium-2", name: "Cyber Grid", description: "Enhanced grid background with animations" },
      { id: "elite-2", name: "Neural Network", description: "Neural network animations in the background" },
      { id: "legendary-2", name: "Reality Glitch", description: "Reality-bending visual glitches" },
    ],
    bonus: [
      { id: "basic-4", name: "Lucky Charm", description: "+5% chance for critical clicks" },
      { id: "premium-3", name: "Credit Boost", description: "+10% credits per click" },
      { id: "elite-3", name: "Efficiency Module", description: "Upgrades cost 15% less" },
      { id: "legendary-3", name: "Golden Touch", description: "+25% credits from all sources" },
    ],
    special: [
      { id: "premium-5", name: "Time Warp", description: "Auto clickers run 20% faster" },
      { id: "elite-5", name: "Temporal Shift", description: "Chance to get double credits randomly" },
      { id: "legendary-5", name: "Time Dilation", description: "Everything runs 30% faster" },
    ],
  }
  const { t } = useTranslation("admin")

  const toggleEffect = (type: string, effectId: string) => {
    const currentEffects =
      type === "click"
        ? clickEffects
        : type === "visual"
          ? visualEffects
          : type === "bonus"
            ? bonusEffects
            : specialEffects

    if (currentEffects.includes(effectId)) {
      onChange(
        type,
        currentEffects.filter((id) => id !== effectId),
      )
    } else {
      onChange(type, [...currentEffects, effectId])
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
        {t("effectSettings")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t("clickEffects")}
          </h4>

          <div className="space-y-2">
            {allEffects.click.map((effect) => (
              <div key={effect.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={clickEffects.includes(effect.id)}
                  onChange={() => toggleEffect("click", effect.id)}
                  id={`effect-${effect.id}`}
                  className="mr-2"
                />
                <label htmlFor={`effect-${effect.id}`} className="flex-1" style={{ color: secondaryColor }}>
                  <span className="font-bold">{effect.name}</span> - {effect.description}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <CyberButton onClick={() => onChange("click", [])} primaryColor={secondaryColor} className="text-sm py-1">
              {t("resetAll")}
            </CyberButton>

            <CyberButton
              onClick={() =>
                onChange(
                  "click",
                  allEffects.click.map((e) => e.id),
                )
              }
              primaryColor={accentColor}
              className="text-sm py-1"
            >
              {t("selectAll")}
            </CyberButton>
          </div>
        </CyberCard>

        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t("visualEffects")}
          </h4>

          <div className="space-y-2">
            {allEffects.visual.map((effect) => (
              <div key={effect.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={visualEffects.includes(effect.id)}
                  onChange={() => toggleEffect("visual", effect.id)}
                  id={`effect-${effect.id}`}
                  className="mr-2"
                />
                <label htmlFor={`effect-${effect.id}`} className="flex-1" style={{ color: secondaryColor }}>
                  <span className="font-bold">{effect.name}</span> - {effect.description}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <CyberButton onClick={() => onChange("visual", [])} primaryColor={secondaryColor} className="text-sm py-1">
              {t("resetAll")}
            </CyberButton>

            <CyberButton
              onClick={() =>
                onChange(
                  "visual",
                  allEffects.visual.map((e) => e.id),
                )
              }
              primaryColor={accentColor}
              className="text-sm py-1"
            >
              {t("selectAll")}
            </CyberButton>
          </div>
        </CyberCard>

        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t("bonusEffects")}
          </h4>

          <div className="space-y-2">
            {allEffects.bonus.map((effect) => (
              <div key={effect.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={bonusEffects.includes(effect.id)}
                  onChange={() => toggleEffect("bonus", effect.id)}
                  id={`effect-${effect.id}`}
                  className="mr-2"
                />
                <label htmlFor={`effect-${effect.id}`} className="flex-1" style={{ color: secondaryColor }}>
                  <span className="font-bold">{effect.name}</span> - {effect.description}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <CyberButton onClick={() => onChange("bonus", [])} primaryColor={secondaryColor} className="text-sm py-1">
              {t("resetAll")}
            </CyberButton>

            <CyberButton
              onClick={() =>
                onChange(
                  "bonus",
                  allEffects.bonus.map((e) => e.id),
                )
              }
              primaryColor={accentColor}
              className="text-sm py-1"
            >
              {t("selectAll")}
            </CyberButton>
          </div>
        </CyberCard>

        <CyberCard primaryColor={primaryColor} secondaryColor={secondaryColor} className="p-4">
          <h4 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
            {t("specialEffects")}
          </h4>

          <div className="space-y-2">
            {allEffects.special.map((effect) => (
              <div key={effect.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={specialEffects.includes(effect.id)}
                  onChange={() => toggleEffect("special", effect.id)}
                  id={`effect-${effect.id}`}
                  className="mr-2"
                />
                <label htmlFor={`effect-${effect.id}`} className="flex-1" style={{ color: secondaryColor }}>
                  <span className="font-bold">{effect.name}</span> - {effect.description}
                </label>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <CyberButton onClick={() => onChange("special", [])} primaryColor={secondaryColor} className="text-sm py-1">
              {t("resetAll")}
            </CyberButton>

            <CyberButton
              onClick={() =>
                onChange(
                  "special",
                  allEffects.special.map((e) => e.id),
                )
              }
              primaryColor={accentColor}
              className="text-sm py-1"
            >
              {t("selectAll")}
            </CyberButton>
          </div>
        </CyberCard>
      </div>
    </div>
  )
}

// І замінимо функцію Documentation на:
function Documentation({
  primaryColor,
  secondaryColor,
  accentColor,
  language,
}: {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  language: Language
}) {
  return (
    <GameDocumentation
      language={language}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      accentColor={accentColor}
    />
  )
}

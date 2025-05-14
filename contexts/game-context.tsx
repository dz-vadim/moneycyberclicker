"use client"

import type React from "react"

import { createContext, useState, useEffect, useCallback, useMemo, useContext, type ReactNode } from "react"
import { useNotification } from "@/components/notification-system"
import { useTranslation } from "@/utils/i18n"
import { saveGame, loadGame, resetGame, saveLeaderboardEntry, type GameSave } from "@/utils/save-system"
import { calculateRobocoinsGain, calculateBonusMultiplier } from "@/utils/prestige-system"
import { applyRandomAntiEffect } from "@/utils/anti-effects"
import { upgradesConfig, ADVANCED_REQUIREMENTS, SPECIAL_REQUIREMENTS } from "@/config/upgrades"
import { skinsConfig } from "@/config/skins"
import { antiEffectsConfig, antiEffectsEN } from "@/config/anti-effects"
import type { UpgradeId, SkinId, TabId, UpgradeCategory } from "@/types/game-types"
import type { AntiEffect } from "@/utils/anti-effects"
import type { CaseReward } from "@/config/cases"
import type { Prize } from "@/config/fortune-wheel"

// Define the context type
interface GameContextType {
  // Game state
  money: number
  totalEarned: number
  clickCount: number
  moneyPerClick: number
  robocoins: number
  totalRobocoins: number
  prestigeCount: number
  playerName: string
  language: string
  musicEnabled: boolean
  activeTab: TabId
  activeCategory: UpgradeCategory
  activeSkin: SkinId
  upgrades: Record<string, any>
  skins: Record<string, any>
  activeAntiEffects: AntiEffect[]
  unlockedCases: string[]
  casesOpened: Record<string, number>
  clickEffects: string[]
  visualEffects: string[]
  bonusEffects: string[]
  specialEffects: string[]
  showEffect: boolean
  clickPosition: { x: number; y: number }
  showCrit: boolean
  critText: string
  comboCount: number
  comboTimer: number
  showSettings: boolean
  isAdvancedUnlocked: boolean
  isSpecialUnlocked: boolean
  showFortuneWheel: boolean
  clickButtonBlocked: boolean
  antiEffectProtection: boolean
  antiEffectProtectionTimeLeft: number
  useDesktopInterface: boolean
  desktopInterfaceUnlocked: boolean
  customThemes: Record<string, any>
  lastSavedTime: number

  // Game actions
  setMoney: (money: number) => void
  setTotalEarned: (totalEarned: number) => void
  setClickCount: (clickCount: number) => void
  setMoneyPerClick: (moneyPerClick: number) => void
  setPlayerName: (playerName: string) => void
  setLanguage: (language: string) => void
  setMusicEnabled: (musicEnabled: boolean) => void
  setActiveTab: (activeTab: TabId) => void
  setActiveCategory: (activeCategory: UpgradeCategory) => void
  setActiveSkin: (activeSkin: SkinId) => void
  setShowSettings: (showSettings: boolean) => void
  setShowFortuneWheel: (showFortuneWheel: boolean) => void
  setUseDesktopInterface: (useDesktopInterface: boolean) => void

  // Game functions
  handleClick: (e: React.MouseEvent) => void
  buyUpgrade: (upgradeId: UpgradeId) => void
  buySkin: (skinId: SkinId) => void
  applySkin: (skinId: SkinId) => void
  handleWheelSpin: (prize: Prize) => void
  handleCaseOpen: (reward: CaseReward) => void
  performPrestige: () => void
  fixAntiEffect: (effectId: string) => void
  saveGameState: () => void
  resetGameState: () => void
  applyCustomTheme: (themeId: string) => void
  saveCustomTheme: (name: string, colors: any) => void
  handleActionThatResetsCombo: () => void
  showAchievementNotification: (text: string) => void
}

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined)

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const { showNotification, showConfirm } = useNotification()

  // Game state
  const [money, setMoney] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const [showEffect, setShowEffect] = useState(false)
  const [moneyPerClick, setMoneyPerClick] = useState(1)
  const [critText, setCritText] = useState("")
  const [showCrit, setShowCrit] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>("upgrades")
  const [activeCategory, setActiveCategory] = useState<UpgradeCategory>("basic")
  const [comboCount, setComboCount] = useState(0)
  const [comboTimer, setComboTimer] = useState(0)
  const [playerName, setPlayerName] = useState("Player")
  const [clickEffects, setClickEffects] = useState<string[]>([])
  const [visualEffects, setVisualEffects] = useState<string[]>([])
  const [bonusEffects, setBonusEffects] = useState<string[]>([])
  const [specialEffects, setSpecialEffects] = useState<string[]>([])
  const [temporaryMultiplier, setTemporaryMultiplier] = useState(1)
  const [multiplierTimeLeft, setMultiplierTimeLeft] = useState(0)
  const [lastSavedTime, setLastSavedTime] = useState(Date.now())
  const [showSettings, setShowSettings] = useState(false)
  const [robocoins, setRobocoins] = useState(0)
  const [totalRobocoins, setTotalRobocoins] = useState(0)
  const [prestigeCount, setPrestigeCount] = useState(0)
  const [activeAntiEffects, setActiveAntiEffects] = useState<AntiEffect[]>([])
  const [language, setLanguage] = useState<string>("en")
  const [antiEffectChance, setAntiEffectChance] = useState(0.01)
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [unlockedCases, setUnlockedCases] = useState<string[]>(["basic"])
  const [casesOpened, setCasesOpened] = useState<Record<string, number>>({
    basic: 0,
    premium: 0,
    elite: 0,
    legendary: 0,
  })
  const [showFortuneWheel, setShowFortuneWheel] = useState(false)
  const [useDesktopInterface, setUseDesktopInterface] = useState(false)
  const [desktopInterfaceUnlocked, setDesktopInterfaceUnlocked] = useState(false)
  const [antiEffectProtection, setAntiEffectProtection] = useState(false)
  const [antiEffectProtectionTimeLeft, setAntiEffectProtectionTimeLeft] = useState(0)
  const [clickButtonBlocked, setClickButtonBlocked] = useState(false)
  const [customThemes, setCustomThemes] = useState<Record<string, any>>({})
  const [userPerformedOtherAction, setUserPerformedOtherAction] = useState(false)

  // Initialize upgrades from config
  const [upgrades, setUpgrades] = useState(() => {
    const initialUpgrades: Record<string, any> = {}
    Object.entries(upgradesConfig).forEach(([id, config]) => {
      initialUpgrades[id] = {
        ...config,
        level: 0,
        owned: false,
      }
    })
    return initialUpgrades
  })

  // Initialize skins from config
  const [skins, setSkins] = useState(() => {
    const initialSkins: Record<string, any> = {}
    Object.entries(skinsConfig).forEach(([id, config]) => {
      initialSkins[id] = {
        ...config,
        owned: id === "cyberpunk", // Only cyberpunk is owned by default
      }
    })
    return initialSkins
  })

  // Set active skin
  const [activeSkin, setActiveSkin] = useState<SkinId>("cyberpunk")

  // Get translations
  const { t } = useTranslation(language)

  // Check if categories are unlocked based on upgrade levels
  const isAdvancedUnlocked = useMemo(() => {
    return (
      upgrades.doubleValue.level >= ADVANCED_REQUIREMENTS.doubleValue &&
      upgrades.autoClicker.level >= ADVANCED_REQUIREMENTS.autoClicker &&
      upgrades.criticalClick.level >= ADVANCED_REQUIREMENTS.criticalClick &&
      upgrades.passiveIncome.level >= ADVANCED_REQUIREMENTS.passiveIncome
    )
  }, [upgrades])

  const isSpecialUnlocked = useMemo(() => {
    return (
      isAdvancedUnlocked &&
      upgrades.clickMultiplier.level >= SPECIAL_REQUIREMENTS.clickMultiplier &&
      upgrades.autoClickerSpeed.level >= SPECIAL_REQUIREMENTS.autoClickerSpeed &&
      upgrades.clickCombo.level >= SPECIAL_REQUIREMENTS.clickCombo &&
      upgrades.offlineEarnings.level >= SPECIAL_REQUIREMENTS.offlineEarnings
    )
  }, [isAdvancedUnlocked, upgrades])

  // Show achievement notification
  const showAchievementNotification = useCallback(
    (text: string) => {
      showNotification({
        type: "success",
        message: text,
        duration: 3000,
      })
    },
    [showNotification],
  )

  // Load game on initial render
  useEffect(() => {
    const loadSavedGame = () => {
      const savedGame = loadGame()
      if (savedGame) {
        // Set basic stats
        setMoney(savedGame.money)
        setTotalEarned(savedGame.totalEarned)
        setClickCount(savedGame.clickCount)
        setMoneyPerClick(savedGame.moneyPerClick)
        setPlayerName(savedGame.playerName || "Player")

        // Set prestige data
        if (savedGame.robocoins !== undefined) {
          setRobocoins(savedGame.robocoins)
          setTotalRobocoins(savedGame.totalRobocoins || savedGame.robocoins)
          setPrestigeCount(savedGame.prestigeCount || 0)
        }

        // Set language
        if (savedGame.language) {
          setLanguage(savedGame.language)
        }

        // Set active anti-effects
        if (savedGame.activeAntiEffects) {
          setActiveAntiEffects(savedGame.activeAntiEffects)
        }

        // Set music preference (default to off if not set)
        if (savedGame.musicEnabled !== undefined) {
          setMusicEnabled(savedGame.musicEnabled)
        }

        // Set unlocked cases
        if (savedGame.unlockedCases && savedGame.unlockedCases.length > 0) {
          setUnlockedCases(savedGame.unlockedCases)
        }

        // Set cases opened count
        if (savedGame.casesOpened) {
          setCasesOpened(savedGame.casesOpened)
        }

        // Set desktop interface preference
        if (savedGame.useDesktopInterface !== undefined) {
          setUseDesktopInterface(savedGame.useDesktopInterface)
        }

        // Set desktop interface unlock status
        if (savedGame.desktopInterfaceUnlocked !== undefined) {
          setDesktopInterfaceUnlocked(savedGame.desktopInterfaceUnlocked)
        }

        // Set custom themes
        if (savedGame.customThemes) {
          setCustomThemes(savedGame.customThemes)
        }

        // Set upgrades
        setUpgrades((prev) => {
          const newUpgrades = { ...prev }
          Object.entries(savedGame.upgrades).forEach(([id, data]) => {
            if (newUpgrades[id as UpgradeId]) {
              newUpgrades[id as UpgradeId].level = (data as any).level
              newUpgrades[id as UpgradeId].owned = (data as any).owned
            }
          })
          return newUpgrades
        })

        // Set skins
        setSkins((prev) => {
          const newSkins = { ...prev }
          Object.entries(savedGame.skins).forEach(([id, data]) => {
            if (newSkins[id as SkinId]) {
              newSkins[id as SkinId].owned = (data as any).owned
            }
          })
          return newSkins
        })

        // Set active skin
        if (savedGame.activeSkin && skins[savedGame.activeSkin as SkinId]) {
          setActiveSkin(savedGame.activeSkin as SkinId)
        }

        // Set unlocked rewards
        if (savedGame.unlockedRewards) {
          const clickEffs: string[] = []
          const visualEffs: string[] = []
          const bonusEffs: string[] = []
          const specialEffs: string[] = []

          savedGame.unlockedRewards.forEach((id: string) => {
            // This is a simplified version - in a real implementation,
            // you'd need to map reward IDs to their types
            if (id.includes("click")) clickEffs.push(id)
            else if (id.includes("visual")) visualEffs.push(id)
            else if (id.includes("bonus")) bonusEffs.push(id)
            else if (id.includes("special")) specialEffs.push(id)
          })

          setClickEffects(clickEffs)
          setVisualEffects(visualEffs)
          setBonusEffects(bonusEffs)
          setSpecialEffects(specialEffs)
        }

        // Calculate offline earnings if applicable
        const offlineTime = Math.floor((Date.now() - savedGame.lastSaved) / 1000)
        if (offlineTime > 60 && upgrades.offlineEarnings.level > 0) {
          const offlineRate = upgrades.passiveIncome.level * upgrades.passiveIncome.effect
          const offlineEfficiency = upgrades.offlineEarnings.level * upgrades.offlineEarnings.effect
          const offlineEarnings = Math.floor(offlineTime * offlineRate * offlineEfficiency)

          if (offlineEarnings > 0) {
            setMoney((prev) => prev + offlineEarnings)
            setTotalEarned((prev) => prev + offlineEarnings)

            // Show notification
            setTimeout(() => {
              showAchievementNotification(t("offlineEarnings", { amount: offlineEarnings.toLocaleString() }))
            }, 1000)
          }
        }

        showAchievementNotification(t("gameLoaded"))
      }
    }

    loadSavedGame()

    // Set up auto-save with a proper interval
    const saveInterval = setInterval(() => {
      saveGameState()
      setLastSavedTime(Date.now())
      console.log("Auto-saved game at", new Date().toLocaleTimeString())
    }, 60000) // Auto-save every minute

    return () => {
      clearInterval(saveInterval)
    }
  }, [])

  // Check for desktop interface unlock when skins change
  const checkDesktopInterfaceUnlock = useCallback(() => {
    const allSkinsOwned = Object.values(skins).every((skin) => skin.owned)
    if (allSkinsOwned && !desktopInterfaceUnlocked) {
      setDesktopInterfaceUnlocked(true)
      showAchievementNotification(t("desktopUnlocked"))
    }
  }, [skins, desktopInterfaceUnlocked, t, showAchievementNotification])

  useEffect(() => {
    checkDesktopInterfaceUnlock()
  }, [skins, checkDesktopInterfaceUnlock])

  // Save game state
  const saveGameState = useCallback(() => {
    const gameState: GameSave = {
      money,
      totalEarned,
      clickCount,
      moneyPerClick,
      upgrades: Object.entries(upgrades).reduce(
        (acc, [id, upgrade]) => {
          acc[id] = {
            level: upgrade.level,
            owned: upgrade.owned,
          }
          return acc
        },
        {} as Record<string, { level: number; owned: boolean }>,
      ),
      skins: Object.entries(skins).reduce(
        (acc, [id, skin]) => {
          acc[id] = {
            owned: skin.owned,
          }
          return acc
        },
        {} as Record<string, { owned: boolean }>,
      ),
      activeSkin,
      playerName,
      unlockedRewards: [...clickEffects, ...visualEffects, ...bonusEffects, ...specialEffects],
      lastSaved: Date.now(),
      // New fields
      robocoins,
      totalRobocoins,
      prestigeCount,
      activeAntiEffects,
      language,
      unlockedCases,
      casesOpened,
      musicEnabled,
      useDesktopInterface,
      desktopInterfaceUnlocked,
      customThemes,
    }

    saveGame(gameState)
    saveLeaderboardEntry(playerName, robocoins)
    setLastSavedTime(Date.now())
    showAchievementNotification(t("gameSaved"))
  }, [
    money,
    totalEarned,
    clickCount,
    moneyPerClick,
    upgrades,
    skins,
    activeSkin,
    playerName,
    clickEffects,
    visualEffects,
    bonusEffects,
    specialEffects,
    robocoins,
    totalRobocoins,
    prestigeCount,
    activeAntiEffects,
    language,
    unlockedCases,
    casesOpened,
    musicEnabled,
    useDesktopInterface,
    desktopInterfaceUnlocked,
    customThemes,
    t,
    showAchievementNotification,
  ])

  // Reset game
  const resetGameState = useCallback(() => {
    showConfirm(t("resetConfirmation"), () => {
      resetGame()
      window.location.reload()
    })
  }, [t, showConfirm])

  // Helper function to add money and track total earned
  const addMoney = useCallback(
    (amount: number) => {
      // Apply bonuses from case rewards
      let finalAmount = amount

      if (bonusEffects.includes("premium-3")) {
        finalAmount *= 1.1 // 10% more from Credit Boost
      }

      if (bonusEffects.includes("legendary-3")) {
        finalAmount *= 1.25 // 25% more from Golden Touch
      }

      // Apply prestige multiplier
      const prestigeMultiplier = calculateBonusMultiplier(robocoins)
      finalAmount *= prestigeMultiplier

      setMoney((prev) => prev + finalAmount)
      setTotalEarned((prev) => prev + finalAmount)

      // Check for unlocks based on total earned
      if (
        !isAdvancedUnlocked &&
        upgrades.doubleValue.level >= ADVANCED_REQUIREMENTS.doubleValue &&
        upgrades.autoClicker.level >= ADVANCED_REQUIREMENTS.autoClicker &&
        upgrades.criticalClick.level >= ADVANCED_REQUIREMENTS.criticalClick &&
        upgrades.passiveIncome.level >= ADVANCED_REQUIREMENTS.passiveIncome
      ) {
        showAchievementNotification(t("advancedUnlocked"))
      }

      if (
        isAdvancedUnlocked &&
        !isSpecialUnlocked &&
        upgrades.clickMultiplier.level >= SPECIAL_REQUIREMENTS.clickMultiplier &&
        upgrades.autoClickerSpeed.level >= SPECIAL_REQUIREMENTS.autoClickerSpeed &&
        upgrades.clickCombo.level >= SPECIAL_REQUIREMENTS.clickCombo &&
        upgrades.offlineEarnings.level >= SPECIAL_REQUIREMENTS.offlineEarnings
      ) {
        showAchievementNotification(t("specialUnlocked"))
      }

      // Random chance to generate a negative effect
      if (Math.random() < antiEffectChance && !antiEffectProtection) {
        generateAntiEffect()
      }
    },
    [
      bonusEffects,
      robocoins,
      isAdvancedUnlocked,
      isSpecialUnlocked,
      upgrades,
      antiEffectProtection,
      t,
      showAchievementNotification,
      antiEffectChance,
    ],
  )

  // Generate anti-effect
  const generateAntiEffect = useCallback(() => {
    // Создаем список всех возможных анти-эффектов
    const possibleAntiEffects = [...antiEffectsConfig]

    // Добавляем анти-эффект блокировки кнопки клика
    possibleAntiEffects.push({
      id: "click-button-block",
      name: language === "en" ? "Click Button Block" : "Блокування кнопки кліку",
      description: language === "en" ? "Blocks the click button completely" : "Повністю блокує кнопку кліку",
      type: "click",
      severity: 1,
      fixCost: Math.max(100, Math.floor(money * 0.1)), // 10% от текущих денег, но не менее 100
      duration: -1,
      applied: false,
    })

    // Добавляем анти-эффекты для каждого улучшения
    Object.entries(upgrades).forEach(([id, upgrade]) => {
      if (upgrade.level > 0) {
        // Створюємо унікальний ID для блока покращення
        const blockId = `${id}-block`;
        
        // Перевіряємо, чи такий ефект вже не активний
        if (!activeAntiEffects.some(effect => effect.id === blockId)) {
          possibleAntiEffects.push({
            id: blockId,
            name: language === "en" ? `${upgrade.name} Block` : `Блокування ${upgrade.name}`,
            description:
              language === "en" ? `Blocks the ${upgrade.name} upgrade effect` : `Блокує ефект покращення ${upgrade.name}`,
            type: "upgrade",
            targetUpgrade: id as UpgradeId,
            severity: 1,
            fixCost: Math.max(upgrade.baseCost, Math.floor(money * 0.05)), // 5% от текущих денег или базовая стоимость улучшения
            duration: -1,
            applied: false,
          })
        }
      }
    })

    // Фільтруємо, щоб не додавати ефекти, які вже активні
    const availableEffects = possibleAntiEffects.filter(
      effect => !activeAntiEffects.some(activeEffect => activeEffect.id === effect.id)
    );

    // Перевіряємо, чи є доступні ефекти
    if (availableEffects.length === 0) return;

    // Выбираем случайный анти-эффект
    const randomIndex = Math.floor(Math.random() * availableEffects.length)
    const selectedEffect = availableEffects[randomIndex]

    // Проверяем, достаточно ли денег для исправления
    if (money >= selectedEffect.fixCost) {
      // Если это блокировка кнопки клика
      if (selectedEffect.id === "click-button-block") {
        setClickButtonBlocked(true)
      }

      // Добавляем анти-эффект
      setActiveAntiEffects((prev) => [...prev, selectedEffect])

      // Показываем уведомление
      const effectName =
        language === "en" ? antiEffectsEN[selectedEffect.id]?.name || selectedEffect.id : selectedEffect.name

      showAchievementNotification(t("problemDetected", { name: effectName }))
    }
  }, [language, money, upgrades, activeAntiEffects, showAchievementNotification, t])

  // Handle click
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Check if click button is blocked
      if (clickButtonBlocked) {
        showAchievementNotification(t("clickButtonBlockedMessage"))
        return
      }

      // Get click position for the effect
      const rect = e.currentTarget.getBoundingClientRect()
      setClickPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })

      // Handle combo system
      let comboMultiplier = 1
      if (upgrades.clickCombo.level > 0) {
        // Check if combo is blocked by anti-effects
        const comboAntiEffect = activeAntiEffects.find((e) => e.type === "combo")

        if (!comboAntiEffect) {
          setComboCount((prev) => prev + 1)
          setComboTimer(3) // Reset timer to 3 seconds

          comboMultiplier = 1 + comboCount * upgrades.clickCombo.level * upgrades.clickCombo.effect
        }
      }

      // Apply temporary multiplier if active
      comboMultiplier *= temporaryMultiplier

      // Check for critical click
      let earnedMoney = moneyPerClick * comboMultiplier
      let critChance = upgrades.criticalClick.level * upgrades.criticalClick.effect

      // Apply bonus from case rewards if any
      if (bonusEffects.includes("basic-4")) {
        critChance += 0.05 // +5% from Lucky Charm
      }

      // Check if critical clicks are blocked by anti-effects
      const criticalAntiEffect = activeAntiEffects.find((e) => e.type === "critical")
      const isCritical = !criticalAntiEffect && Math.random() < critChance

      if (isCritical) {
        earnedMoney *= 5
        setCritText(t("critical", { amount: Math.floor(earnedMoney) }))
        setShowCrit(true)
        setTimeout(() => setShowCrit(false), 1000)
      }

      // Check for lucky click
      const luckyChance = upgrades.luckyClicks.level * upgrades.luckyClicks.effect
      const isLucky = Math.random() < luckyChance

      if (isLucky) {
        const luckyBonus = Math.floor(earnedMoney * 10) // 10x bonus
        earnedMoney += luckyBonus

        setTimeout(
          () => {
            setCritText(t("lucky", { amount: luckyBonus }))
            setShowCrit(true)
            setTimeout(() => setShowCrit(false), 1000)
          },
          isCritical ? 1200 : 0,
        )
      }

      // Check for mega click (if owned)
      if (upgrades.megaClick.level > 0 && Math.random() < 0.01) {
        // 1% chance
        const megaMultiplier = upgrades.megaClick.level * upgrades.megaClick.effect
        earnedMoney *= megaMultiplier

        setTimeout(
          () => {
            setCritText(t("mega", { amount: Math.floor(earnedMoney) }))
            setShowCrit(true)
            setTimeout(() => setShowCrit(false), 1000)
          },
          isCritical || isLucky ? 1200 : 0,
        )
      }

      // Check for Temporal Shift special effect
      if (specialEffects.includes("elite-5") && Math.random() < 0.05) {
        // 5% chance
        earnedMoney *= 2

        setTimeout(
          () => {
            setCritText(t("temporalShift", { amount: Math.floor(earnedMoney) }))
            setShowCrit(true)
            setTimeout(() => setShowCrit(false), 1000)
          },
          isCritical || isLucky ? 1400 : 0,
        )
      }

      // Check for anti-effects
      let antiEffectMultiplier = 1
      const clickAntiEffect = activeAntiEffects.find((e) => e.type === "click")
      const incomeAntiEffect = activeAntiEffects.find((e) => e.type === "income")

      if (clickAntiEffect) {
        antiEffectMultiplier *= 1 - clickAntiEffect.severity
      }

      if (incomeAntiEffect) {
        antiEffectMultiplier *= 1 - incomeAntiEffect.severity
      }

      // Apply anti-effect multiplier
      earnedMoney *= antiEffectMultiplier

      // Add money and increment click count
      addMoney(earnedMoney)
      setClickCount((prev) => prev + 1)

      // Trigger click effect
      setShowEffect(true)
      setTimeout(() => setShowEffect(false), 500)

      // Add a chance to trigger a new anti-effect
      if (!antiEffectProtection) {
        handleAntiEffects()
      }
    },
    [
      clickButtonBlocked,
      upgrades,
      activeAntiEffects,
      temporaryMultiplier,
      moneyPerClick,
      comboCount,
      bonusEffects,
      specialEffects,
      antiEffectProtection,
      t,
      showAchievementNotification,
      addMoney,
    ],
  )

  // Handle anti-effects
  const handleAntiEffects = useCallback(() => {
    // Check for new anti-effects on click (with increasing chance based on money)
    const effectChance = Math.min(0.05, antiEffectChance + (totalEarned / 1_000_000_000) * 0.01)
    const newEffect = applyRandomAntiEffect(activeAntiEffects, totalEarned, effectChance)

    if (newEffect) {
      // Если это блокировка кнопки клика
      if (newEffect.id === "click-button-block") {
        setClickButtonBlocked(true)
      }

      // Перевіряємо, що ефект з таким ID ще не доданий
      if (!activeAntiEffects.some(effect => effect.id === newEffect.id)) {
        setActiveAntiEffects((prev) => [...prev, newEffect])

        const effectName =
          language === "en"
            ? antiEffectsEN[newEffect.id]?.name || newEffect.id.charAt(0).toUpperCase() + newEffect.id.slice(1)
            : newEffect.name

        showAchievementNotification(t("problemDetected", { name: effectName }))
      }
    }
  }, [antiEffectChance, totalEarned, activeAntiEffects, language, t, showAchievementNotification])

  // Fix anti-effect
  const fixAntiEffect = useCallback(
    (effectId: string) => {
      // Mark that user performed an action that should reset combo
      setUserPerformedOtherAction(true)

      const effectToFix = activeAntiEffects.find((e) => e.id === effectId)
      if (!effectToFix) return

      if (money >= effectToFix.fixCost) {
        setMoney((prev) => prev - effectToFix.fixCost)

        // Если это блокировка кнопки клика
        if (effectId === "click-button-block") {
          setClickButtonBlocked(false)
        }

        setActiveAntiEffects((prev) => prev.filter((e) => e.id !== effectId))

        const effectName =
          language === "en"
            ? antiEffectsEN[effectId]?.name || effectId.charAt(0).toUpperCase() + effectId.slice(1)
            : effectToFix.name

        showAchievementNotification(t("problemFixed", { name: effectName }))
      }
    },
    [activeAntiEffects, money, language, t, showAchievementNotification],
  )

  // Calculate upgrade cost
  const calculateUpgradeCost = useCallback(
    (upgradeId: UpgradeId) => {
      const upgrade = upgrades[upgradeId]
      let cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level))

      // Apply discount if Efficiency Module is active
      if (bonusEffects.includes("elite-3")) {
        cost = Math.floor(cost * 0.85) // 15% discount
      }

      return cost
    },
    [upgrades, bonusEffects],
  )

  // Buy upgrade
  const buyUpgrade = useCallback(
    (upgradeId: UpgradeId) => {
      // Mark that user performed an action that should reset combo
      setUserPerformedOtherAction(true)

      const upgrade = upgrades[upgradeId]
      const cost = calculateUpgradeCost(upgradeId)

      // Check if upgrades are blocked by ransomware
      const upgradesBlocked = activeAntiEffects.some((e) => e.id === "ransomware")
      if (upgradesBlocked) {
        showAchievementNotification(t("upgradesBlocked"))
        return
      }

      // Check if specific upgrade is blocked
      const upgradeBlocked = activeAntiEffects.some((e) => e.type === "upgrade" && e.targetUpgrade === upgradeId)
      if (upgradeBlocked) {
        showAchievementNotification(t("upgradeBlocked", { name: upgrade.name }))
        return
      }

      if (money >= cost) {
        setMoney((prev) => prev - cost)

        setUpgrades((prev) => ({
          ...prev,
          [upgradeId]: {
            ...prev[upgradeId],
            level: prev[upgradeId].level + 1,
            owned: true,
          },
        }))

        // Apply upgrade effects
        if (upgradeId === "doubleValue") {
          // Увеличиваем moneyPerClick на effect вместо умножения
          setMoneyPerClick((prev) => prev + upgrade.effect)
        } else if (upgradeId === "clickMultiplier") {
          setMoneyPerClick((prev) => prev * upgrade.effect)
        }

        // Show achievement for first purchase of each category
        if (upgrade.level === 0) {
          if (upgrade.category === "advanced") {
            showAchievementNotification(t("advancedPurchased", { name: upgrade.name }))
          } else if (upgrade.category === "special") {
            showAchievementNotification(t("specialPurchased", { name: upgrade.name }))
          }
        }

        // Auto-save after significant purchase
        if (cost > 10000) {
          saveGameState()
        }
      }
    },
    [upgrades, calculateUpgradeCost, activeAntiEffects, money, t, showAchievementNotification, saveGameState],
  )

  // Buy skin
  const buySkin = useCallback(
    (skinId: SkinId) => {
      // Mark that user performed an action that should reset combo
      setUserPerformedOtherAction(true)

      const skin = skins[skinId]

      if (money >= skin.cost && !skin.owned) {
        setMoney((prev) => prev - skin.cost)

        setSkins((prev) => ({
          ...prev,
          [skinId]: {
            ...prev[skinId],
            owned: true,
          },
        }))

        showAchievementNotification(t("skinUnlocked", { name: skin.name }))

        // Check if all skins are now owned to unlock desktop interface
        checkDesktopInterfaceUnlock()

        // Auto-save after skin purchase
        saveGameState()
      }
    },
    [skins, money, t, showAchievementNotification, checkDesktopInterfaceUnlock, saveGameState],
  )

  // Apply skin
  const applySkin = useCallback(
    (skinId: SkinId) => {
      // Mark that user performed an action that should reset combo
      setUserPerformedOtherAction(true)

      if (skins[skinId].owned) {
        setActiveSkin(skinId)

        // Apply theme colors
        document.documentElement.style.setProperty("--primary", skins[skinId].colors.primary)
        document.documentElement.style.setProperty("--secondary", skins[skinId].colors.secondary)
        document.documentElement.style.setProperty("--accent", skins[skinId].colors.accent)
      }
    },
    [skins],
  )

  // Apply custom theme
  const applyCustomTheme = useCallback(
    (themeId: string) => {
      // Mark that user performed an action that should reset combo
      setUserPerformedOtherAction(true)

      if (customThemes[themeId]) {
        const theme = customThemes[themeId]

        // Apply theme colors
        document.documentElement.style.setProperty("--primary", theme.colors.primary)
        document.documentElement.style.setProperty("--secondary", theme.colors.secondary)
        document.documentElement.style.setProperty("--accent", theme.colors.accent)

        showAchievementNotification(t("themeApplied", { name: theme.name }))
      }
    },
    [customThemes, t, showAchievementNotification],
  )

  // Save custom theme
  const saveCustomTheme = useCallback(
    (name: string, colors: any) => {
      // Mark that user performed an action that should reset combo
      setUserPerformedOtherAction(true)

      const themeId = `custom-${Date.now()}`

      setCustomThemes((prev) => ({
        ...prev,
        [themeId]: {
          name,
          colors,
        },
      }))

      showAchievementNotification(t("themeCreated", { name }))
      saveGameState()
    },
    [t, showAchievementNotification, saveGameState],
  )

  // Handle fortune wheel spin
  const handleWheelSpin = useCallback(
    (prize: Prize) => {
      // Mark that user performed an action that should reset combo
      setUserPerformedOtherAction(true)

      switch (prize.type) {
        case "money":
          addMoney(prize.value)
          showAchievementNotification(t("moneyPrize", { amount: prize.value.toLocaleString() }))
          break
        case "multiplier":
          setTemporaryMultiplier(prize.value)
          setMultiplierTimeLeft(prize.value === 2 ? 60 : 30) // 1 min or 30 sec
          showAchievementNotification(
            t("multiplierPrize", { value: prize.value, time: prize.value === 2 ? "60" : "30" }),
          )
          break
        case "boost":
          // Apply boost to auto clickers
          if (upgrades.autoClicker.level > 0) {
            setTemporaryMultiplier(prize.value)
            setMultiplierTimeLeft(120) // 2 minutes
            showAchievementNotification(t("boostPrize", { percent: ((prize.value - 1) * 100).toFixed(0) }))
          } else {
            // Fallback if no auto clickers
            addMoney(2000)
            showAchievementNotification(t("noAutoHack"))
          }
          break
        case "special":
          // Random special prize
          const specialPrizes = [
            // Lucky day - all clicks are critical for 30 seconds
            () => {
              setTemporaryMultiplier(5)
              setMultiplierTimeLeft(30)
              showAchievementNotification(t("luckyDay"))
            },
            // Anti-effect protection
            () => {
              setAntiEffectProtection(true)
              setAntiEffectProtectionTimeLeft(300) // 5 minutes
              showAchievementNotification(t("antiEffectShield", { time: "5" }))
            },
            // Clear all anti-effects
            () => {
              if (activeAntiEffects.length > 0) {
                setActiveAntiEffects([])
                setClickButtonBlocked(false)
                showAchievementNotification(t("systemCleanup"))
              } else {
                addMoney(5000)
                showAchievementNotification(t("noAntiEffects", { amount: "5,000" }))
              }
            },
          ]

          // Choose random special prize
          const randomPrize = specialPrizes[Math.floor(Math.random() * specialPrizes.length)]
          randomPrize()
          break
      }
    },
    [addMoney, upgrades.autoClicker.level, activeAntiEffects, t, showAchievementNotification],
  )

  // Handle case opening
  const handleCaseOpen = useCallback(
    (reward: CaseReward) => {
      // Mark that user performed an action that should reset combo
      setUserPerformedOtherAction(true)

      // Определяем стоимость кейса
      let caseCost = 0
      let caseType = ""

      if (reward.id.startsWith("basic")) {
        caseCost = 5000
        caseType = "basic"
      } else if (reward.id.startsWith("premium")) {
        caseCost = 25000
        caseType = "premium"
      } else if (reward.id.startsWith("elite")) {
        caseCost = 100000
        caseType = "elite"
      } else if (reward.id.startsWith("legendary")) {
        caseCost = 500000
        caseType = "legendary"
      }

      // Снимаем деньги
      setMoney((prev) => prev - caseCost)

      // Увеличиваем счетчик открытых кейсов
      setCasesOpened((prev) => ({
        ...prev,
        [caseType]: (prev[caseType] || 0) + 1,
      }))

      // Проверяем, нужно ли разблокировать следующий тип кейсов
      if (caseType === "basic" && casesOpened.basic + 1 >= 10 && !unlockedCases.includes("premium")) {
        setUnlockedCases((prev) => [...prev, "premium"])
        showAchievementNotification("Premium Cases Unlocked! You can now purchase premium cases.")
      } else if (caseType === "premium" && casesOpened.premium + 1 >= 10 && !unlockedCases.includes("elite")) {
        setUnlockedCases((prev) => [...prev, "elite"])
        showAchievementNotification("Elite Cases Unlocked! You can now purchase elite cases.")
      } else if (caseType === "elite" && casesOpened.elite + 1 >= 10 && !unlockedCases.includes("legendary")) {
        setUnlockedCases((prev) => [...prev, "legendary"])
        showAchievementNotification("Legendary Cases Unlocked! You can now purchase legendary cases.")
      }

      // Добавляем награду в соответствующую категорию
      switch (reward.type) {
        case "clickEffect":
          setClickEffects((prev) => [...prev, reward.id])
          break
        case "visualEffect":
          setVisualEffects((prev) => [...prev, reward.id])
          break
        case "bonus":
          setBonusEffects((prev) => [...prev, reward.id])
          break
        case "special":
          setSpecialEffects((prev) => [...prev, reward.id])
          break
      }

      // Шанс получить временную защиту от анти-эффектов
      if (Math.random() < 0.1) {
        // 10% шанс
        setAntiEffectProtection(true)
        setAntiEffectProtectionTimeLeft(180) // 3 минуты
        showAchievementNotification(t("antiEffectShield", { time: "3" }))
      }

      // Auto-save after getting a reward
      saveGameState()
    },
    [casesOpened, unlockedCases, t, showAchievementNotification, saveGameState],
  )

  // Perform prestige
  const performPrestige = useCallback(() => {
    // Mark that user performed an action that should reset combo
    setUserPerformedOtherAction(true)

    // Проверяем, чи розблоковані всі можливості для першого престижу
    const allUpgradesUnlocked = Object.values(upgrades).every((upgrade) => upgrade.level > 0)
    const allSkinsOwned = Object.values(skins).every((skin) => skin.owned)

    // Якщо це перший престиж, перевіряємо умови
    if (prestigeCount === 0 && (!allUpgradesUnlocked || !allSkinsOwned)) {
      showAchievementNotification(t("prestigeRequirements"))
      return
    }

    const prestigeGain = calculateRobocoinsGain(totalEarned)

    if (prestigeGain < 0.01) {
      showAchievementNotification(t("notEnoughProgress"))
      return
    }

    // Confirm with the user
    showConfirm(t("prestigeConfirmation", { amount: prestigeGain.toFixed(2) }), () => {
      // Update robocoins
      const newRobocoins = robocoins + prestigeGain
      setRobocoins(newRobocoins)
      setTotalRobocoins(totalRobocoins + prestigeGain)
      setPrestigeCount(prestigeCount + 1)

      // Reset game state
      setMoney(0)
      setTotalEarned(0)
      setClickCount(0)
      setMoneyPerClick(1) // Начальное значение клика теперь 1
      setComboCount(0)
      setComboTimer(0)
      setTemporaryMultiplier(1)
      setMultiplierTimeLeft(0)

      // Reset upgrades
      setUpgrades((prev) => {
        const resetUpgrades = { ...prev }
        Object.keys(resetUpgrades).forEach((key) => {
          resetUpgrades[key as UpgradeId].level = 0
          resetUpgrades[key as UpgradeId].owned = false
        })
        return resetUpgrades
      })

      // Сохраняем скины при престиже
      // Очищаем анти-эффекты
      setActiveAntiEffects([])
      setClickButtonBlocked(false)

      // Сбрасываем разблокированные кейсы до базового
      setUnlockedCases(["basic"])
      setCasesOpened({ basic: 0, premium: 0, elite: 0, legendary: 0 })

      // После первого престижа разблокируем возможность создания собственной темы
      if (prestigeCount === 0) {
        // Показываем уведомление о возможности создания собственной темы
        setTimeout(() => {
          showAchievementNotification(t("customThemeUnlocked"))
        }, 2000)
      }

      // Show achievement
      showAchievementNotification(`Prestige complete! +${prestigeGain.toFixed(2)} Robocoins`)

      // Save game
      saveGameState()
    })
  }, [
    upgrades,
    skins,
    prestigeCount,
    totalEarned,
    robocoins,
    totalRobocoins,
    t,
    showAchievementNotification,
    showConfirm,
    saveGameState,
  ])

  // Function to handle actions that reset combo
  const handleActionThatResetsCombo = useCallback(() => {
    setUserPerformedOtherAction(true)
  }, [])

  // Reset combo when user performs other actions
  useEffect(() => {
    if (userPerformedOtherAction && comboCount > 0) {
      setComboCount(0)
      setComboTimer(0)
      setUserPerformedOtherAction(false)
    }
  }, [userPerformedOtherAction, comboCount])

  // Combo timer effect
  useEffect(() => {
    let comboTimerRef: NodeJS.Timeout | null = null

    if (comboCount > 0 && !comboTimerRef) {
      comboTimerRef = setInterval(() => {
        setComboTimer((prev) => {
          if (prev <= 0) {
            if (comboTimerRef) {
              clearInterval(comboTimerRef)
              comboTimerRef = null
            }
            setComboCount(0)
            return 0
          }
          return prev - 0.1
        })
      }, 100)
    }

    return () => {
      if (comboTimerRef) {
        clearInterval(comboTimerRef)
      }
    }
  }, [comboCount])

  // Temporary multiplier effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (multiplierTimeLeft > 0) {
      interval = setInterval(() => {
        setMultiplierTimeLeft((prev) => {
          if (prev <= 1) {
            setTemporaryMultiplier(1)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [multiplierTimeLeft])

  // Anti-effect protection timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (antiEffectProtectionTimeLeft > 0) {
      setAntiEffectProtection(true)

      interval = setInterval(() => {
        setAntiEffectProtectionTimeLeft((prev) => {
          if (prev <= 1) {
            setAntiEffectProtection(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [antiEffectProtectionTimeLeft])

  // Auto-clicker effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (upgrades.autoClicker.level > 0) {
      // Check if auto-clicker is blocked by anti-effect
      const autoClickerBlocked = activeAntiEffects.some((e) => e.id === "auto-hack-block")

      if (!autoClickerBlocked) {
        // Calculate clicks per second with bonuses
        let clicksPerSecond =
          upgrades.autoClicker.level +
          (upgrades.autoClickerSpeed.level > 0 ? upgrades.autoClickerSpeed.level * upgrades.autoClickerSpeed.effect : 0)

        // Apply special effects if any
        if (specialEffects.includes("elite-5")) {
          clicksPerSecond *= 1.2 // 20% faster from Time Warp
        }

        if (specialEffects.includes("legendary-5")) {
          clicksPerSecond *= 1.3 // 30% faster from Time Dilation
        }

        // Apply anti-effect reduction
        const autoAntiEffect = activeAntiEffects.find((e) => e.type === "auto")
        if (autoAntiEffect) {
          clicksPerSecond *= 1 - autoAntiEffect.severity
        }

        interval = setInterval(() => {
          const autoClickValue = moneyPerClick * temporaryMultiplier

          // Apply income anti-effect
          let finalValue = autoClickValue
          const incomeAntiEffect = activeAntiEffects.find((e) => e.type === "income")
          if (incomeAntiEffect) {
            finalValue *= 1 - incomeAntiEffect.severity
          }

          addMoney(finalValue)
          setClickCount((prev) => prev + 1)
        }, 1000 / clicksPerSecond)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [
    upgrades.autoClicker.level,
    upgrades.autoClickerSpeed.level,
    upgrades.autoClickerSpeed.effect,
    moneyPerClick,
    temporaryMultiplier,
    specialEffects,
    activeAntiEffects,
    addMoney,
  ])

  // Passive income effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (upgrades.passiveIncome.level > 0) {
      // Check if passive income is blocked by anti-effect
      const passiveIncomeBlocked = activeAntiEffects.some((e) => e.id === "passive-income-block")

      if (!passiveIncomeBlocked) {
        let incomePerSecond = upgrades.passiveIncome.level * upgrades.passiveIncome.effect

        // Apply bonuses if any
        if (bonusEffects.includes("legendary-3")) {
          incomePerSecond *= 1.25 // 25% more from Golden Touch
        }

        // Check if passive income is blocked by anti-effects
        const passiveAntiEffect = activeAntiEffects.find((e) => e.type === "passive")

        if (!passiveAntiEffect) {
          interval = setInterval(() => {
            // Apply income anti-effect
            let finalIncome = incomePerSecond * temporaryMultiplier
            const incomeAntiEffect = activeAntiEffects.find((e) => e.type === "income")
            if (incomeAntiEffect) {
              finalIncome *= 1 - incomeAntiEffect.severity
            }

            addMoney(finalIncome)
          }, 1000)
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [
    upgrades.passiveIncome.level,
    upgrades.passiveIncome.effect,
    temporaryMultiplier,
    bonusEffects,
    activeAntiEffects,
    addMoney,
  ])

  // Add a timer for anti-effects based on game time
  useEffect(() => {
    let antiEffectInterval: NodeJS.Timeout | null = null

    if (!antiEffectProtection) {
      antiEffectInterval = setInterval(() => {
        // Chance increases with total earned
        const baseChance = 0.005 // 0.5% base chance every 30 seconds
        const scaledChance = baseChance * (1 + totalEarned / 10000000)
        const cappedChance = Math.min(0.05, scaledChance) // Cap at 5%

        const newEffect = applyRandomAntiEffect(activeAntiEffects, totalEarned, cappedChance)

        if (newEffect) {
          // Если это блокировка кнопки клика
          if (newEffect.id === "click-button-block") {
            setClickButtonBlocked(true)
          }

          setActiveAntiEffects((prev) => [...prev, newEffect])

          const effectName =
            language === "en"
              ? antiEffectsEN[newEffect.id]?.name || newEffect.id.charAt(0).toUpperCase() + newEffect.id.slice(1)
              : newEffect.name

          showAchievementNotification(t("problemDetected", { name: effectName }))
        }
      }, 30000) // Check every 30 seconds
    }

    return () => {
      if (antiEffectInterval) clearInterval(antiEffectInterval)
    }
  }, [totalEarned, activeAntiEffects, language, antiEffectProtection, t, showAchievementNotification])

  // Add a useEffect to apply prestige bonus
  useEffect(() => {
    if (robocoins > 0) {
      const bonusMultiplier = calculateBonusMultiplier(robocoins)
      // Apply the bonus to base money per click (now 1 instead of 500)
      setMoneyPerClick(1 * bonusMultiplier)
    }
  }, [robocoins])

  // Add a useEffect to handle anti-effect timers
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (activeAntiEffects.length > 0) {
      interval = setInterval(() => {
        setActiveAntiEffects((prev) =>
          prev
            .map((effect) => {
              if (effect.timeRemaining !== undefined && effect.timeRemaining > 0) {
                return {
                  ...effect,
                  timeRemaining: effect.timeRemaining - 1,
                }
              }
              return effect
            })
            .filter((effect) => effect.timeRemaining === undefined || effect.timeRemaining > 0),
        )
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeAntiEffects])

  // Provide the context value
  const contextValue: GameContextType = {
    // Game state
    money,
    totalEarned,
    clickCount,
    moneyPerClick,
    robocoins,
    totalRobocoins,
    prestigeCount,
    playerName,
    language,
    musicEnabled,
    activeTab,
    activeCategory,
    activeSkin,
    upgrades,
    skins,
    activeAntiEffects,
    unlockedCases,
    casesOpened,
    clickEffects,
    visualEffects,
    bonusEffects,
    specialEffects,
    showEffect,
    clickPosition,
    showCrit,
    critText,
    comboCount,
    comboTimer,
    showSettings,
    isAdvancedUnlocked,
    isSpecialUnlocked,
    showFortuneWheel,
    clickButtonBlocked,
    antiEffectProtection,
    antiEffectProtectionTimeLeft,
    useDesktopInterface,
    desktopInterfaceUnlocked,
    customThemes,
    lastSavedTime,

    // Game actions
    setMoney,
    setTotalEarned,
    setClickCount,
    setMoneyPerClick,
    setPlayerName,
    setLanguage,
    setMusicEnabled,
    setActiveTab,
    setActiveCategory,
    setActiveSkin,
    setShowSettings,
    setShowFortuneWheel,
    setUseDesktopInterface,

    // Game functions
    handleClick,
    buyUpgrade,
    buySkin,
    applySkin,
    handleWheelSpin,
    handleCaseOpen,
    performPrestige,
    fixAntiEffect,
    saveGameState,
    resetGameState,
    applyCustomTheme,
    saveCustomTheme,
    handleActionThatResetsCombo,
    showAchievementNotification,
  }

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
}

// Hook to use the game context
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

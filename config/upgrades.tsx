import type React from "react"
// Видаляємо імпорт іконок, оскільки вони більше не потрібні
// import { TrendingUp, Clock, Sparkles, Repeat, Layers, Cpu, Gauge, Coins, Target, Rocket } from "lucide-react"
import type { UpgradeCategory } from "@/types/game-types"

export interface UpgradeConfig {
  name: string
  description: string
  icon: string
  baseCost: number
  costMultiplier: number
  effect: number
  effectMultiplier: number
  category: UpgradeCategory
  unlockCost: number
  translationKey: string
  descriptionKey: string
}

export const upgradesConfig: Record<string, UpgradeConfig> = {
  doubleValue: {
    name: "Click Value",
    description: "Increase your credits per click by 1",
    icon: "⬆️",
    baseCost: 10,
    costMultiplier: 1.5,
    effect: 1,
    effectMultiplier: 1.5,
    category: "basic",
    unlockCost: 0,
    translationKey: "clickValue",
    descriptionKey: "clickValueDesc",
  },
  autoClicker: {
    name: "Auto Hack",
    description: "Automatically clicks once per second",
    icon: "⏱️",
    baseCost: 50,
    costMultiplier: 1.6,
    effect: 1,
    effectMultiplier: 1,
    category: "basic",
    unlockCost: 0,
    translationKey: "autoHack",
    descriptionKey: "autoHackDesc",
  },
  criticalClick: {
    name: "Critical Hack",
    description: "Chance to get 5x credits on click",
    icon: "✨",
    baseCost: 100,
    costMultiplier: 1.7,
    effect: 0.05,
    effectMultiplier: 1.2,
    category: "basic",
    unlockCost: 0,
    translationKey: "criticalHack",
    descriptionKey: "criticalHackDesc",
  },
  passiveIncome: {
    name: "Passive Income",
    description: "Earn credits over time without clicking",
    icon: "🔄",
    baseCost: 200,
    costMultiplier: 1.8,
    effect: 0.5,
    effectMultiplier: 1.3,
    category: "basic",
    unlockCost: 0,
    translationKey: "passiveIncome",
    descriptionKey: "passiveIncomeDesc",
  },
  clickMultiplier: {
    name: "Click Multiplier",
    description: "Multiply your click value",
    icon: "📊",
    baseCost: 100000,
    costMultiplier: 1.9,
    effect: 1.5,
    effectMultiplier: 1.1,
    category: "advanced",
    unlockCost: 200000,
    translationKey: "clickMultiplier",
    descriptionKey: "clickMultiplierDesc",
  },
  autoClickerSpeed: {
    name: "Auto Speed",
    description: "Increase auto hack speed",
    icon: "💻",
    baseCost: 250000,
    costMultiplier: 2.0,
    effect: 1,
    effectMultiplier: 1.2,
    category: "advanced",
    unlockCost: 200000,
    translationKey: "autoSpeed",
    descriptionKey: "autoSpeedDesc",
  },
  clickCombo: {
    name: "Click Combo",
    description: "Consecutive clicks increase value",
    icon: "📈",
    baseCost: 500000,
    costMultiplier: 2.1,
    effect: 0.1,
    effectMultiplier: 1.1,
    category: "advanced",
    unlockCost: 200000,
    translationKey: "clickCombo",
    descriptionKey: "clickComboDesc",
  },
  offlineEarnings: {
    name: "Offline Earnings",
    description: "Earn credits while away",
    icon: "💰",
    baseCost: 1000000,
    costMultiplier: 2.2,
    effect: 0.1,
    effectMultiplier: 1.2,
    category: "advanced",
    unlockCost: 200000,
    translationKey: "offlineEarnings",
    descriptionKey: "offlineEarningsDesc",
  },
  luckyClicks: {
    name: "Lucky Clicks",
    description: "Random chance for bonus credits",
    icon: "🎯",
    baseCost: 2500000,
    costMultiplier: 2.3,
    effect: 0.02,
    effectMultiplier: 1.3,
    category: "special",
    unlockCost: 5000000,
    translationKey: "luckyClicks",
    descriptionKey: "luckyClicksDesc",
  },
  megaClick: {
    name: "Mega Click",
    description: "Special ability: massive click value",
    icon: "🚀",
    baseCost: 5000000,
    costMultiplier: 2.5,
    effect: 10,
    effectMultiplier: 1.5,
    category: "special",
    unlockCost: 5000000,
    translationKey: "megaClick",
    descriptionKey: "megaClickDesc",
  },
}

// Define the requirements for each category
export const ADVANCED_REQUIREMENTS = {
  doubleValue: 15,
  autoClicker: 10,
  criticalClick: 5,
  passiveIncome: 1,
}

export const SPECIAL_REQUIREMENTS = {
  clickMultiplier: 10,
  autoClickerSpeed: 8,
  clickCombo: 5,
  offlineEarnings: 3,
}

export interface CaseConfig {
  id: string
  name: string
  cost: number
  description: string
  color: string
  image: string
  requiredToUnlock: number
  nextCase: string | null
  requiredOpens: number
}

export const casesConfig: CaseConfig[] = [
  {
    id: "basic",
    name: "Basic Case",
    cost: 5000,
    description: "Common rewards with a small chance for something special",
    color: "#05d9e8",
    image: "📦",
    requiredToUnlock: 0,
    nextCase: "premium",
    requiredOpens: 10,
  },
  {
    id: "premium",
    name: "Premium Case",
    cost: 25000,
    description: "Better rewards with higher chances for rare items",
    color: "#ff2a6d",
    image: "🎁",
    requiredToUnlock: 10,
    nextCase: "elite",
    requiredOpens: 10,
  },
  {
    id: "elite",
    name: "Elite Case",
    cost: 100000,
    description: "High-quality rewards with guaranteed rare or better",
    color: "#d300c5",
    image: "💎",
    requiredToUnlock: 10,
    nextCase: "legendary",
    requiredOpens: 10,
  },
  {
    id: "legendary",
    name: "Legendary Case",
    cost: 500000,
    description: "The best rewards with a chance for legendary items",
    color: "#39ff14",
    image: "🏆",
    requiredToUnlock: 10,
    nextCase: null,
    requiredOpens: 0,
  },
]

export interface CaseReward {
  id: string
  name: string
  type: "clickEffect" | "visualEffect" | "bonus" | "special"
  description: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  value: number
}

export const caseRewards: Record<string, CaseReward[]> = {
  basic: [
    {
      id: "basic-1",
      name: "Pixel Dust",
      type: "clickEffect",
      description: "Adds pixel particles to your clicks",
      rarity: "common",
      value: 1,
    },
    {
      id: "basic-2",
      name: "Echo Click",
      type: "clickEffect",
      description: "Creates echo ripples when clicking",
      rarity: "common",
      value: 1,
    },
    {
      id: "basic-3",
      name: "Neon Glow",
      type: "visualEffect",
      description: "Adds a subtle neon glow to the game",
      rarity: "uncommon",
      value: 2,
    },
    {
      id: "basic-4",
      name: "Lucky Charm",
      type: "bonus",
      description: "+5% chance for critical clicks",
      rarity: "uncommon",
      value: 5,
    },
    {
      id: "basic-5",
      name: "Digital Rain",
      type: "visualEffect",
      description: "Matrix-style digital rain in the background",
      rarity: "rare",
      value: 3,
    },
  ],
  premium: [
    {
      id: "premium-1",
      name: "Plasma Burst",
      type: "clickEffect",
      description: "Explosive plasma effect on clicks",
      rarity: "uncommon",
      value: 2,
    },
    {
      id: "premium-2",
      name: "Cyber Grid",
      type: "visualEffect",
      description: "Enhanced grid background with animations",
      rarity: "uncommon",
      value: 2,
    },
    {
      id: "premium-3",
      name: "Credit Boost",
      type: "bonus",
      description: "+10% credits per click",
      rarity: "rare",
      value: 10,
    },
    {
      id: "premium-4",
      name: "Hologram Click",
      type: "clickEffect",
      description: "Holographic projection on each click",
      rarity: "rare",
      value: 3,
    },
    {
      id: "premium-5",
      name: "Time Warp",
      type: "special",
      description: "Auto clickers run 20% faster",
      rarity: "epic",
      value: 20,
    },
  ],
  elite: [
    {
      id: "elite-1",
      name: "Quantum Particles",
      type: "clickEffect",
      description: "Quantum particle effects on clicks",
      rarity: "rare",
      value: 3,
    },
    {
      id: "elite-2",
      name: "Neural Network",
      type: "visualEffect",
      description: "Neural network animations in the background",
      rarity: "rare",
      value: 3,
    },
    {
      id: "elite-3",
      name: "Efficiency Module",
      type: "bonus",
      description: "Upgrades cost 15% less",
      rarity: "epic",
      value: 15,
    },
    {
      id: "elite-4",
      name: "Fractal Click",
      type: "clickEffect",
      description: "Fractal patterns explode from clicks",
      rarity: "epic",
      value: 4,
    },
    {
      id: "elite-5",
      name: "Temporal Shift",
      type: "special",
      description: "Chance to get double credits randomly",
      rarity: "legendary",
      value: 5,
    },
  ],
  legendary: [
    {
      id: "legendary-1",
      name: "Supernova",
      type: "clickEffect",
      description: "Cosmic explosion on critical clicks",
      rarity: "epic",
      value: 4,
    },
    {
      id: "legendary-2",
      name: "Reality Glitch",
      type: "visualEffect",
      description: "Reality-bending visual glitches",
      rarity: "epic",
      value: 4,
    },
    {
      id: "legendary-3",
      name: "Golden Touch",
      type: "bonus",
      description: "+25% credits from all sources",
      rarity: "legendary",
      value: 25,
    },
    {
      id: "legendary-4",
      name: "Dimensional Rift",
      type: "clickEffect",
      description: "Opens rifts in reality when clicking",
      rarity: "legendary",
      value: 5,
    },
    {
      id: "legendary-5",
      name: "Time Dilation",
      type: "special",
      description: "Everything runs 30% faster",
      rarity: "legendary",
      value: 30,
    },
  ],
}

// Rarity colors
export const rarityColors = {
  common: "#aaaaaa",
  uncommon: "#1eff00",
  rare: "#0070dd",
  epic: "#a335ee",
  legendary: "#ff8000",
}

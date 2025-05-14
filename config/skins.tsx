export interface SkinConfig {
  name: string
  description: string
  cost: number
  unlockRequirement: string | null
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  translationKey: string
  descriptionKey: string
}

export const skinsConfig: Record<string, SkinConfig> = {
  cyberpunk: {
    name: "Cyberpunk",
    description: "Neon lights in the dark city",
    cost: 0,
    unlockRequirement: null,
    colors: {
      primary: "#ff2a6d",
      secondary: "#05d9e8",
      accent: "#d300c5",
      background: "#0d0221",
    },
    translationKey: "cyberpunk",
    descriptionKey: "cyberpunkDesc",
  },
  vaporwave: {
    name: "Vaporwave",
    description: "Retro aesthetics from digital dreams",
    cost: 100,
    unlockRequirement: "cyberpunk",
    colors: {
      primary: "#ff71ce",
      secondary: "#01cdfe",
      accent: "#b967ff",
      background: "#05ffa1",
    },
    translationKey: "vaporwave",
    descriptionKey: "vaporwaveDesc",
  },
  retro: {
    name: "Retro",
    description: "8-bit nostalgia from the arcade era",
    cost: 250,
    unlockRequirement: "vaporwave",
    colors: {
      primary: "#f8b500",
      secondary: "#fc3c3c",
      accent: "#5d13e7",
      background: "#22272e",
    },
    translationKey: "retro",
    descriptionKey: "retroDesc",
  },
  matrix: {
    name: "Matrix",
    description: "Enter the digital realm of code",
    cost: 500,
    unlockRequirement: "retro",
    colors: {
      primary: "#00ff41",
      secondary: "#008f11",
      accent: "#003b00",
      background: "#0d0208",
    },
    translationKey: "matrix",
    descriptionKey: "matrixDesc",
  },
  neon: {
    name: "Neon City",
    description: "Bright lights of the metropolis",
    cost: 1000,
    unlockRequirement: "matrix",
    colors: {
      primary: "#fe00fe",
      secondary: "#00ffff",
      accent: "#ffff00",
      background: "#121212",
    },
    translationKey: "neon",
    descriptionKey: "neonDesc",
  },
  synthwave: {
    name: "Synthwave",
    description: "Retro-futuristic sunset vibes",
    cost: 2000,
    unlockRequirement: "neon",
    colors: {
      primary: "#fc28a8",
      secondary: "#03edf9",
      accent: "#ff8b00",
      background: "#2b213a",
    },
    translationKey: "synthwave",
    descriptionKey: "synthwaveDesc",
  },
  outrun: {
    name: "Outrun",
    description: "Fast cars and neon grids",
    cost: 4000,
    unlockRequirement: "synthwave",
    colors: {
      primary: "#ff9933",
      secondary: "#ff00ff",
      accent: "#0066ff",
      background: "#000033",
    },
    translationKey: "outrun",
    descriptionKey: "outrunDesc",
  },
  holographic: {
    name: "Holographic",
    description: "Shimmering iridescent interface",
    cost: 8000,
    unlockRequirement: "outrun",
    colors: {
      primary: "#88ffff",
      secondary: "#ff88ff",
      accent: "#ffff88",
      background: "#111122",
    },
    translationKey: "holographic",
    descriptionKey: "holographicDesc",
  },
  glitch: {
    name: "Glitch",
    description: "Corrupted data aesthetic",
    cost: 15000,
    unlockRequirement: "holographic",
    colors: {
      primary: "#ff0000",
      secondary: "#00ff00",
      accent: "#0000ff",
      background: "#000000",
    },
    translationKey: "glitch",
    descriptionKey: "glitchDesc",
  },
  quantum: {
    name: "Quantum",
    description: "Beyond reality interface",
    cost: 30000,
    unlockRequirement: "glitch",
    colors: {
      primary: "#c0ffee",
      secondary: "#facade",
      accent: "#bada55",
      background: "#010101",
    },
    translationKey: "quantum",
    descriptionKey: "quantumDesc",
  },
  cosmic: {
    name: "Cosmic",
    description: "Explore the depths of the universe",
    cost: 60000,
    unlockRequirement: "quantum",
    colors: {
      primary: "#9d00ff",
      secondary: "#00aaff",
      accent: "#ffcc00",
      background: "#000022",
    },
    translationKey: "cosmic",
    descriptionKey: "cosmicDesc",
  },
  binary: {
    name: "Binary",
    description: "Pure digital existence",
    cost: 120000,
    unlockRequirement: "cosmic",
    colors: {
      primary: "#ffffff",
      secondary: "#000000",
      accent: "#00ff00",
      background: "#111111",
    },
    translationKey: "binary",
    descriptionKey: "binaryDesc",
  },
  hyperspace: {
    name: "Hyperspace",
    description: "Beyond the limits of reality",
    cost: 250000,
    unlockRequirement: "binary",
    colors: {
      primary: "#ff00aa",
      secondary: "#00ffcc",
      accent: "#ffff00",
      background: "#110022",
    },
    translationKey: "hyperspace",
    descriptionKey: "hyperspaceDesc",
  },
  digital: {
    name: "Digital Void",
    description: "The space between data",
    cost: 500000,
    unlockRequirement: "hyperspace",
    colors: {
      primary: "#0088ff",
      secondary: "#00ff88",
      accent: "#ff0088",
      background: "#000011",
    },
    translationKey: "digital",
    descriptionKey: "digitalDesc",
  },
  ethereal: {
    name: "Ethereal",
    description: "Transcend physical limitations",
    cost: 1000000,
    unlockRequirement: "digital",
    colors: {
      primary: "#aaccff",
      secondary: "#ffaacc",
      accent: "#ffffaa",
      background: "#112233",
    },
    translationKey: "ethereal",
    descriptionKey: "etherealDesc",
  },
}

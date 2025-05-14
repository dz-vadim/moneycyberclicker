export interface Prize {
  id: string
  type: "money" | "multiplier" | "boost" | "special"
  value: number
  label: string
}

export const prizes: Prize[] = [
  { id: "money-1", type: "money", value: 1000, label: "¥1K" },
  { id: "multiplier-1", type: "multiplier", value: 2, label: "2x" },
  { id: "money-2", type: "money", value: 5000, label: "¥5K" },
  { id: "boost-1", type: "boost", value: 1.5, label: "BOOST" },
  { id: "money-3", type: "money", value: 10000, label: "¥10K" },
  { id: "multiplier-2", type: "multiplier", value: 3, label: "3x" },
  { id: "money-4", type: "money", value: 25000, label: "¥25K" },
  { id: "special-1", type: "special", value: 5, label: "LUCKY" },
]

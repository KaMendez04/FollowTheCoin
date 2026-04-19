export type GameMode = "menu" | "playing" | "finished"

export type GameObject = {
  id: string
  type: "coin" | "character" | "decoy" | "obstacle"
  x: number
  y: number
  character?: string
  color?: string
  design?: string
  collected?: boolean
  _size?: number
}

export type GameLevel = {
  id: number
  name: string
  difficulty: "easy" | "medium" | "hard"
  objectCount: number
  timeLimit: number
  gridSize: { width: number; height: number }
}

export type EnhancedGameState = {
  mode: GameMode
  level: GameLevel
  score: number
  timeLeft: number
  playerCharacter: string
  playerName: string
  objects: GameObject[]
  coinPosition: { x: number; y: number }
  coinsCollected: number
  gameStartTime: number
}

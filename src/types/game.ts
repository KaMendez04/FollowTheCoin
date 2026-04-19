export type AvatarType = "Mario" | "Kirby" | "Pikachu" | "Robot" | "Luigi"

export type Burst = {
  id: number
  x: number
  y: number
}

export type CoinPosition = {
  x: number
  y: number
}

export type GameStatus = "idle" | "playing" | "finished"

export type ScoreEntry = {
  id: string
  name: string
  avatar: AvatarType
  score: number
  playedAt: number
}

export type PixelCharacterProps = {
  type: string
  color?: string
  delay: number
}

export type Character = Readonly<{
  id: number
  type: string
  color: string
  delay: number
}>

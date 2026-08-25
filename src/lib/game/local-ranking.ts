import { AvatarType, ScoreEntry } from "@/types"
import { GAME_CONFIG, AVATAR_INFO } from "@/constants"
import { storage } from "@/utils"

/** Cuántos jugadores entran en el ranking local. */
export const LOCAL_RANKING_SIZE = 3

/** Dos nombres son el mismo jugador si solo difieren en espacios o mayúsculas. */
function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

function isScoreEntry(value: unknown): value is ScoreEntry {
  if (!value || typeof value !== "object") return false
  const entry = value as Partial<ScoreEntry>
  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.score === "number" &&
    Number.isFinite(entry.score) &&
    typeof entry.playedAt === "number" &&
    Number.isFinite(entry.playedAt) &&
    typeof entry.avatar === "string" &&
    entry.avatar in AVATAR_INFO
  )
}

/** Mejor puntuación primero; a igualdad de puntos gana la partida más reciente. */
function sortRanking(entries: ScoreEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    return b.playedAt - a.playedAt
  })
}

/**
 * Deja una sola entrada por username: la de mejor puntuación de ese jugador
 * (y en empate, la más reciente). Después ordena y corta el top.
 */
function buildRanking(entries: ScoreEntry[]) {
  const bestByName = new Map<string, ScoreEntry>()

  for (const entry of sortRanking(entries)) {
    const key = normalizeName(entry.name)
    if (!bestByName.has(key)) bestByName.set(key, entry)
  }

  return sortRanking([...bestByName.values()]).slice(0, LOCAL_RANKING_SIZE)
}

/** Top de jugadores guardado en este dispositivo. */
export function getLocalRanking(): ScoreEntry[] {
  const stored = storage.getJSON<unknown>(GAME_CONFIG.SCORES_KEY)
  if (!Array.isArray(stored)) return []
  return buildRanking(stored.filter(isScoreEntry))
}

/** Registra una partida y devuelve el ranking ya actualizado. */
export function saveLocalScore(input: {
  name: string
  avatar: AvatarType
  score: number
}): ScoreEntry[] {
  const entry: ScoreEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim() || "Invitado",
    avatar: input.avatar,
    score: input.score,
    playedAt: Date.now(),
  }

  const updated = buildRanking([entry, ...getLocalRanking()])
  storage.setJSON(GAME_CONFIG.SCORES_KEY, updated)
  return updated
}

export function clearLocalRanking(): void {
  storage.removeItem(GAME_CONFIG.SCORES_KEY)
}

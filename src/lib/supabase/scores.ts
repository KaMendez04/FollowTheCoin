import { supabase } from "./client"

export type GameScore = {
  id: string
  room_id: string
  player_nickname: string
  player_avatar: string | null
  score: number
  played_at: string
  room_code: string
}

export type TopScoreEntry = {
  id: string
  player_nickname: string
  player_avatar: string | null
  score: number
  played_at: string
  room_code: string
}

export async function saveRoomScore(
  roomId: string,
  roomCode: string,
  playerNickname: string,
  playerAvatar: string | null,
  score: number
): Promise<GameScore> {
  const { data, error } = await supabase
    .from("game_scores")
    .insert({
      room_id: roomId,
      room_code: roomCode,
      player_nickname: playerNickname.trim() || "Invitado",
      player_avatar: playerAvatar,
      score,
      played_at: new Date().toISOString(),
    })
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`No se pudo guardar la puntuación: ${error?.message ?? "Error desconocido"}`)
  }

  return data
}

export async function getTopScores(limit = 10): Promise<TopScoreEntry[]> {
  try {
    const { data, error } = await supabase
      .from("game_scores")
      .select("*")
      .order("score", { ascending: false })
      .order("played_at", { ascending: false })
      .limit(limit)

    if (error) {
      // Check if it's a "table does not exist" error
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.warn('game_scores table does not exist yet. Run the database setup script.')
        return []
      }
      throw new Error(`No se pudieron cargar las puntuaciones: ${error.message}`)
    }

    return data ?? []
  } catch (error) {
    // Handle network errors or other issues gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('game_scores table does not exist yet. Run the database setup script.')
      return []
    }
    throw error
  }
}

export async function getTopScoresForRoom(roomCode: string, limit = 10): Promise<TopScoreEntry[]> {
  const { data, error } = await supabase
    .from("game_scores")
    .select("*")
    .eq("room_code", roomCode)
    .order("score", { ascending: false })
    .order("played_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`No se pudieron cargar las puntuaciones de la sala: ${error.message}`)
  }

  return data ?? []
}

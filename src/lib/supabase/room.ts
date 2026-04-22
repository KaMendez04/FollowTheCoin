import { supabase } from "./client"

export type RoomStatus = "waiting" | "playing" | "finished"
export type RoomPhase = "lobby" | "playing" | "finished" | "turn-transition"

export type GameRoom = {
  id: string
  code: string
  status: RoomStatus
  max_players: number
  selected_level: number | null
  created_at: string
}

export type RoomPlayer = {
  id: string
  room_id: string
  nickname: string
  avatar: string | null
  device_id: string
  is_host: boolean
  joined_at: string
}

export type RoomState = {
  room_id: string
  phase: RoomPhase
  seed: string | null
  payload: Record<string, any>
  updated_at: string
}

export type CreateRoomInput = {
  nickname: string
  avatar?: string | null
  deviceId: string
  maxPlayers?: number
  selectedLevel?: number
  difficulty?: "easy" | "medium" | "hard"
}

export type TurnState = {
  current_player_index: number
  current_player_id: string
  scores: Record<string, number>
  finished_players: string[]
}

export type TurnGameState = {
  score: number
  timeLeft: number
  coinPosition: { x: number; y: number }
  objects: any[]
  coinsCollected: number
  activePlayerId: string
  startedAt: number
}

export type JoinRoomInput = {
  code: string
  nickname: string
  avatar?: string | null
  deviceId: string
}

export type CreateRoomResult = {
  room: GameRoom
  player: RoomPlayer
  state: RoomState
}

export type JoinRoomResult = {
  room: GameRoom
  player: RoomPlayer
}

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const DEFAULT_MAX_PLAYERS = 2
const DEFAULT_SELECTED_LEVEL = 1

function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase()
}

function generateRoomCode(length = 6): string {
  let result = ""

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * ROOM_CODE_CHARS.length)
    result += ROOM_CODE_CHARS[index]
  }

  return result
}

async function generateUniqueRoomCode(maxAttempts = 10): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRoomCode()

    const { data, error } = await supabase
      .from("game_rooms")
      .select("id")
      .eq("code", code)
      .maybeSingle()

    if (error) {
      throw new Error(`No se pudo validar el código de sala: ${error.message}`)
    }

    if (!data) {
      return code
    }
  }

  throw new Error("No se pudo generar un código de sala único")
}

function mergePayload(
  currentPayload: Record<string, any> = {},
  incomingPayload: Record<string, any> = {}
) {
  return {
    ...currentPayload,
    ...incomingPayload,
    turnState: incomingPayload.turnState ?? currentPayload.turnState,
    gameState: incomingPayload.gameState ?? currentPayload.gameState,
    difficulty: incomingPayload.difficulty ?? currentPayload.difficulty,
    currentTurn: incomingPayload.currentTurn ?? currentPayload.currentTurn,
  }
}

async function deleteRoomSafely(roomId: string): Promise<void> {
  const { error } = await supabase
    .from("game_rooms")
    .delete()
    .eq("id", roomId)

  if (error) {
    console.error("No se pudo limpiar la sala tras un fallo:", error.message)
  }
}

export async function getRoomByCode(code: string): Promise<GameRoom | null> {
  const normalizedCode = normalizeRoomCode(code)

  const { data, error } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle()

  if (error) {
    throw new Error(`No se pudo buscar la sala: ${error.message}`)
  }

  return data
}

export async function getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
  const { data, error } = await supabase
    .from("room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true })

  if (error) {
    throw new Error(`No se pudieron cargar los jugadores: ${error.message}`)
  }

  return data ?? []
}

export async function getRoomState(roomId: string): Promise<RoomState | null> {
  const { data, error } = await supabase
    .from("room_state")
    .select("*")
    .eq("room_id", roomId)
    .maybeSingle()

  if (error) {
    throw new Error(`No se pudo cargar el estado de la sala: ${error.message}`)
  }

  return data
}

export async function createRoom(input: CreateRoomInput): Promise<CreateRoomResult> {
  const code = await generateUniqueRoomCode()

  const { data: room, error: roomError } = await supabase
    .from("game_rooms")
    .insert({
      code,
      status: "waiting",
      max_players: input.maxPlayers ?? DEFAULT_MAX_PLAYERS,
      selected_level: input.selectedLevel ?? DEFAULT_SELECTED_LEVEL,
    })
    .select("*")
    .single()

  if (roomError || !room) {
    throw new Error(`No se pudo crear la sala: ${roomError?.message ?? "Error desconocido"}`)
  }

  const { data: player, error: playerError } = await supabase
    .from("room_players")
    .insert({
      room_id: room.id,
      nickname: input.nickname.trim() || "Invitado",
      avatar: input.avatar ?? null,
      device_id: input.deviceId,
      is_host: true,
    })
    .select("*")
    .single()

  if (playerError || !player) {
    await deleteRoomSafely(room.id)
    throw new Error(
      `No se pudo registrar al host de la sala: ${playerError?.message ?? "Error desconocido"}`
    )
  }

  const { data: state, error: stateError } = await supabase
    .from("room_state")
    .insert({
      room_id: room.id,
      phase: "lobby",
      seed: null,
      payload: {},
    })
    .select("*")
    .single()

  if (stateError || !state) {
    await deleteRoomSafely(room.id)
    throw new Error(
      `No se pudo crear el estado inicial de la sala: ${stateError?.message ?? "Error desconocido"}`
    )
  }

  return {
    room,
    player,
    state,
  }
}

export async function joinRoomByCode(input: JoinRoomInput): Promise<JoinRoomResult> {
  const normalizedCode = normalizeRoomCode(input.code)

  const room = await getRoomByCode(normalizedCode)

  if (!room) {
    throw new Error("La sala no existe")
  }

  if (room.status !== "waiting") {
    throw new Error("La sala ya no está disponible para unirse")
  }

  const currentPlayers = await getRoomPlayers(room.id)

  const existingPlayer = currentPlayers.find((player) => player.device_id === input.deviceId)

  if (existingPlayer) {
    return {
      room,
      player: existingPlayer,
    }
  }

  if (currentPlayers.length >= room.max_players) {
    throw new Error("La sala está llena")
  }

  const { data: player, error: playerError } = await supabase
    .from("room_players")
    .insert({
      room_id: room.id,
      nickname: input.nickname.trim() || "Invitado",
      avatar: input.avatar ?? null,
      device_id: input.deviceId,
      is_host: false,
    })
    .select("*")
    .single()

  if (playerError || !player) {
    throw new Error(
      `No se pudo unir el jugador a la sala: ${playerError?.message ?? "Error desconocido"}`
    )
  }

  return {
    room,
    player,
  }
}

export async function leaveRoom(roomId: string, deviceId: string): Promise<void> {
  const players = await getRoomPlayers(roomId)
  const leavingPlayer = players.find((player) => player.device_id === deviceId)

  if (!leavingPlayer) {
    return
  }

  const { error: deletePlayerError } = await supabase
    .from("room_players")
    .delete()
    .eq("room_id", roomId)
    .eq("device_id", deviceId)

  if (deletePlayerError) {
    throw new Error(`No se pudo salir de la sala: ${deletePlayerError.message}`)
  }

  const remainingPlayers = players.filter((player) => player.device_id !== deviceId)

  if (remainingPlayers.length === 0) {
    await deleteRoomSafely(roomId)
    return
  }

  if (leavingPlayer.is_host) {
    const nextHost = remainingPlayers[0]

    const { error: hostError } = await supabase
      .from("room_players")
      .update({ is_host: true })
      .eq("id", nextHost.id)

    if (hostError) {
      throw new Error(`El jugador salió, pero no se pudo reasignar el host: ${hostError.message}`)
    }
  }
}

export async function startRoomGame(roomId: string): Promise<RoomState> {
  const seed = crypto.randomUUID()

  const { data, error } = await supabase
    .from("room_state")
    .update({
      phase: "playing",
      seed,
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", roomId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`No se pudo iniciar la partida: ${error?.message ?? "Error desconocido"}`)
  }

  const { error: roomError } = await supabase
    .from("game_rooms")
    .update({
      status: "playing",
    })
    .eq("id", roomId)

  if (roomError) {
    throw new Error(`La partida inició, pero no se pudo actualizar la sala: ${roomError.message}`)
  }

  return data
}

export async function startTurnBasedGame(
  roomId: string,
  difficulty: "easy" | "medium" | "hard"
): Promise<RoomState> {
  const players = await getRoomPlayers(roomId)

  if (players.length !== 2) {
    throw new Error("La partida solo puede iniciar cuando hay exactamente 2 jugadores en la sala")
  }

  const seed = crypto.randomUUID()

  const turnState: TurnState = {
    current_player_index: 0,
    current_player_id: players[0].id,
    scores: {},
    finished_players: [],
  }

  const { data, error } = await supabase
    .from("room_state")
    .update({
      phase: "playing",
      seed,
      payload: {
        difficulty,
        turnState,
        currentTurn: 1,
        gameState: null,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", roomId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`No se pudo iniciar el juego por turnos: ${error?.message ?? "Error desconocido"}`)
  }

  const { error: roomError } = await supabase
    .from("game_rooms")
    .update({
      status: "playing",
      selected_level: difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3,
    })
    .eq("id", roomId)

  if (roomError) {
    throw new Error(`El juego inició, pero no se pudo actualizar la sala: ${roomError.message}`)
  }

  return data
}

export async function syncTurnGameState(
  roomId: string,
  gameState: TurnGameState
): Promise<RoomState> {
  const roomState = await getRoomState(roomId)

  if (!roomState) {
    throw new Error("No existe el estado de la sala")
  }

  const nextPayload = mergePayload(roomState.payload ?? {}, {
    gameState,
  })

  const { data, error } = await supabase
    .from("room_state")
    .update({
      phase: "playing",
      payload: nextPayload,
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", roomId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`No se pudo sincronizar el estado del turno: ${error?.message ?? "Error desconocido"}`)
  }

  return data
}

export async function finishPlayerTurn(
  roomId: string,
  playerId: string,
  score: number
): Promise<RoomState> {
  const [roomState, players] = await Promise.all([
    getRoomState(roomId),
    getRoomPlayers(roomId),
  ])

  if (!roomState) {
    throw new Error("No existe el estado de la sala")
  }

  const currentTurnState = (roomState.payload?.turnState ?? null) as TurnState | null

  if (!currentTurnState) {
    throw new Error("No existe el estado del turno")
  }

  const player = players.find((p) => p.id === playerId)

  if (!player) {
    throw new Error("No se encontró el jugador actual")
  }

  const updatedTurnState: TurnState = {
    ...currentTurnState,
    scores: {
      ...currentTurnState.scores,
      [playerId]: score,
    },
    finished_players: currentTurnState.finished_players.includes(playerId)
      ? currentTurnState.finished_players
      : [...currentTurnState.finished_players, playerId],
  }

  const nextPayload = mergePayload(roomState.payload ?? {}, {
    turnState: updatedTurnState,
    lastPlayerScore: score,
    lastPlayerId: playerId,
    gameState: null,
  })

  const { data, error } = await supabase
    .from("room_state")
    .update({
      payload: nextPayload,
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", roomId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`No se pudo guardar el resultado del turno: ${error?.message ?? "Error desconocido"}`)
  }

  const room = await supabase
    .from("game_rooms")
    .select("code")
    .eq("id", roomId)
    .single()

  const roomCode = room.data?.code ?? ""

  const { error: scoreError } = await supabase
    .from("game_scores")
    .insert({
      room_id: roomId,
      room_code: roomCode,
      player_nickname: player.nickname,
      player_avatar: player.avatar,
      score,
      played_at: new Date().toISOString(),
    })

  if (scoreError) {
    console.error("No se pudo guardar el score en game_scores:", scoreError.message)
  }

  return data
}

export async function nextPlayerTurn(roomId: string): Promise<RoomState> {
  const [roomState, players] = await Promise.all([
    getRoomState(roomId),
    getRoomPlayers(roomId),
  ])

  if (!roomState) {
    throw new Error("No existe el estado de la sala")
  }

  const currentTurnState = (roomState.payload?.turnState ?? null) as TurnState | null

  if (!currentTurnState) {
    throw new Error("No existe el estado del turno")
  }

  const nextIndex = currentTurnState.current_player_index + 1

  if (nextIndex >= players.length) {
    return finishRoomGame(roomId, mergePayload(roomState.payload ?? {}, {
      gameCompleted: true,
      gameState: null,
    }))
  }

  const updatedTurnState: TurnState = {
    ...currentTurnState,
    current_player_index: nextIndex,
    current_player_id: players[nextIndex].id,
  }

  const transitionPayload = mergePayload(roomState.payload ?? {}, {
    turnState: updatedTurnState,
    currentTurn: nextIndex + 1,
    gameState: null,
  })

  await supabase
    .from("room_state")
    .update({
      phase: "turn-transition",
      payload: transitionPayload,
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", roomId)

  const { data, error } = await supabase
    .from("room_state")
    .update({
      phase: "playing",
      payload: transitionPayload,
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", roomId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`No se pudo avanzar al siguiente turno: ${error?.message ?? "Error desconocido"}`)
  }

  return data
}

export async function finishRoomGame(
  roomId: string,
  payload: Record<string, unknown> = {}
): Promise<RoomState> {
  const roomState = await getRoomState(roomId)
  const mergedPayload = mergePayload(roomState?.payload ?? {}, payload)

  const { data, error } = await supabase
    .from("room_state")
    .update({
      phase: "finished",
      payload: mergedPayload,
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", roomId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`No se pudo finalizar la partida: ${error?.message ?? "Error desconocido"}`)
  }

  const { error: roomError } = await supabase
    .from("game_rooms")
    .update({
      status: "finished",
    })
    .eq("id", roomId)

  if (roomError) {
    throw new Error(`La partida terminó, pero no se pudo actualizar la sala: ${roomError.message}`)
  }

  return data
}

export async function updateRoomState(
  roomId: string,
  updates: Partial<Pick<RoomState, "phase" | "seed" | "payload">>
): Promise<RoomState> {
  const currentState = await getRoomState(roomId)

  if (!currentState) {
    throw new Error("No existe el estado actual de la sala")
  }

  const mergedPayload =
    updates.payload !== undefined
      ? mergePayload(currentState.payload ?? {}, updates.payload)
      : currentState.payload

  const { data, error } = await supabase
    .from("room_state")
    .update({
      phase: updates.phase ?? currentState.phase,
      seed: updates.seed ?? currentState.seed,
      payload: mergedPayload,
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", roomId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(`No se pudo actualizar el estado de la sala: ${error?.message ?? "Error desconocido"}`)
  }

  return data
}

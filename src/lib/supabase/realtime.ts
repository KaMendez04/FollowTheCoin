import { supabase } from "./client"
import { GameRoom, getRoomByCode, getRoomPlayers, getRoomState, RoomPlayer, RoomState } from "./room"

export type RoomSnapshot = {
  room: GameRoom | null
  players: RoomPlayer[]
  state: RoomState | null
}

export type RoomSubscriptionCallbacks = {
  onSnapshot?: (snapshot: RoomSnapshot) => void
  onError?: (error: Error) => void
}

async function buildRoomSnapshot(roomCode: string): Promise<RoomSnapshot> {
  const room = await getRoomByCode(roomCode)

  if (!room) {
    return {
      room: null,
      players: [],
      state: null,
    }
  }

  const [players, state] = await Promise.all([
    getRoomPlayers(room.id),
    getRoomState(room.id),
  ])

  return {
    room,
    players,
    state,
  }
}

export async function getRoomSnapshot(roomCode: string): Promise<RoomSnapshot> {
  return buildRoomSnapshot(roomCode)
}

export function subscribeToRoom(
  roomCode: string,
  callbacks: RoomSubscriptionCallbacks
) {
  const normalizedCode = roomCode.trim().toUpperCase()

  let isActive = true
  let currentSnapshot: RoomSnapshot = {
    room: null,
    players: [],
    state: null,
  }
  let latestRoomStateUpdatedAt = ""

  const emitSnapshot = () => {
    if (!isActive) return
    callbacks.onSnapshot?.({
      room: currentSnapshot.room,
      players: currentSnapshot.players,
      state: currentSnapshot.state,
    })
  }

  const loadInitialSnapshot = async () => {
    try {
      const snapshot = await buildRoomSnapshot(normalizedCode)

      if (!isActive) return

      currentSnapshot = snapshot
      latestRoomStateUpdatedAt = snapshot.state?.updated_at ?? ""
      emitSnapshot()
    } catch (error) {
      callbacks.onError?.(
        error instanceof Error
          ? error
          : new Error("No se pudo cargar la sala")
      )
    }
  }

  void loadInitialSnapshot()

  const channel = supabase
    .channel(`room-sync:${normalizedCode}`)

    // cambios de la sala
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "game_rooms",
      },
      async (payload: any) => {
        if (!isActive) return

        try {
          const room = await getRoomByCode(normalizedCode)

          if (!room) {
            currentSnapshot = {
              room: null,
              players: [],
              state: null,
            }
            emitSnapshot()
            return
          }

          if (
            currentSnapshot.room &&
            currentSnapshot.room.id !== room.id
          ) {
            return
          }

          currentSnapshot = {
            ...currentSnapshot,
            room,
          }

          emitSnapshot()
        } catch (error) {
          callbacks.onError?.(
            error instanceof Error
              ? error
              : new Error("No se pudo actualizar la sala")
          )
        }
      }
    )

    // cambios de jugadores
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "room_players",
      },
      async (payload: any) => {
        if (!isActive) return

        try {
          const room = currentSnapshot.room ?? (await getRoomByCode(normalizedCode))
          if (!room) return

          const changedRoomId =
            payload?.new?.room_id ?? payload?.old?.room_id

          if (changedRoomId && changedRoomId !== room.id) return

          const players = await getRoomPlayers(room.id)

          currentSnapshot = {
            ...currentSnapshot,
            room,
            players,
          }

          emitSnapshot()
        } catch (error) {
          callbacks.onError?.(
            error instanceof Error
              ? error
              : new Error("No se pudieron actualizar los jugadores")
          )
        }
      }
    )

    // cambios del estado de juego
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "room_state",
      },
      async (payload: any) => {
        if (!isActive) return

        try {
          const room = currentSnapshot.room ?? (await getRoomByCode(normalizedCode))
          if (!room) return

          const changedRoomId =
            payload?.new?.room_id ?? payload?.old?.room_id

          if (changedRoomId && changedRoomId !== room.id) return

          const freshState = await getRoomState(room.id)

          if (
            latestRoomStateUpdatedAt &&
            freshState?.updated_at &&
            new Date(freshState.updated_at).getTime() <
              new Date(latestRoomStateUpdatedAt).getTime()
          ) {
            return
          }

          latestRoomStateUpdatedAt = freshState?.updated_at ?? latestRoomStateUpdatedAt

          currentSnapshot = {
            ...currentSnapshot,
            room,
            state: freshState,
          }

          emitSnapshot()
        } catch (error) {
          callbacks.onError?.(
            error instanceof Error
              ? error
              : new Error("No se pudo actualizar el estado del juego")
          )
        }
      }
    )

    .subscribe((status: string) => {
      if (status === "CHANNEL_ERROR") {
        callbacks.onError?.(
          new Error("Falló la suscripción en tiempo real de la sala")
        )
      }
    })

  return () => {
    isActive = false
    void supabase.removeChannel(channel)
  }
}
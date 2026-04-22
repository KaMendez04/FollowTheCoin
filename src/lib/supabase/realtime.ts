import { supabase } from "./client"
import {
  GameRoom,
  getRoomByCode,
  getRoomPlayers,
  getRoomState,
  RoomPlayer,
  RoomState,
} from "./room"

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
  let channel: ReturnType<typeof supabase.channel> | null = null
  let reconnectTimer: number | null = null
  let fallbackPollTimer: number | null = null
  let refreshInFlight = false
  let refreshQueued = false
  let latestSnapshotKey = ""

  const emitError = (error: unknown) => {
    if (!isActive) return
    callbacks.onError?.(
      error instanceof Error ? error : new Error("No se pudo sincronizar la sala")
    )
  }

  const makeSnapshotKey = (snapshot: RoomSnapshot) => {
    const roomUpdated = snapshot.room?.status ?? "no-room"
    const playersKey = snapshot.players
      .map((player) => `${player.id}:${player.nickname}:${player.is_host ? 1 : 0}`)
      .join("|")
    const stateUpdated = snapshot.state?.updated_at ?? "no-state"

    return `${roomUpdated}__${playersKey}__${stateUpdated}`
  }

  const refreshSnapshot = async () => {
    if (!isActive) return

    if (refreshInFlight) {
      refreshQueued = true
      return
    }

    refreshInFlight = true

    try {
      const snapshot = await buildRoomSnapshot(normalizedCode)

      if (!isActive) return

      const nextKey = makeSnapshotKey(snapshot)

      if (nextKey !== latestSnapshotKey) {
        latestSnapshotKey = nextKey
        callbacks.onSnapshot?.(snapshot)
      }
    } catch (error) {
      emitError(error)
    } finally {
      refreshInFlight = false

      if (refreshQueued && isActive) {
        refreshQueued = false
        void refreshSnapshot()
      }
    }
  }

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const clearFallbackPoll = () => {
    if (fallbackPollTimer !== null) {
      window.clearInterval(fallbackPollTimer)
      fallbackPollTimer = null
    }
  }

  const cleanupChannel = async () => {
    if (!channel) return

    const currentChannel = channel
    channel = null

    try {
      await supabase.removeChannel(currentChannel)
    } catch {
      // no-op
    }
  }

  const scheduleReconnect = () => {
    if (!isActive || reconnectTimer !== null) return

    reconnectTimer = window.setTimeout(async () => {
      reconnectTimer = null

      if (!isActive) return

      await cleanupChannel()
      createChannel()
      void refreshSnapshot()
    }, 1500)
  }

  const createChannel = () => {
    if (!isActive) return

    channel = supabase
      .channel(`room-sync:${normalizedCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
        },
        () => {
          void refreshSnapshot()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_players",
        },
        () => {
          void refreshSnapshot()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_state",
        },
        () => {
          void refreshSnapshot()
        }
      )
      .subscribe((status: string) => {
        if (!isActive) return

        if (status === "SUBSCRIBED") {
          clearReconnectTimer()
          void refreshSnapshot()
          return
        }

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          scheduleReconnect()
        }
      })
  }

  createChannel()
  void refreshSnapshot()

  fallbackPollTimer = window.setInterval(() => {
    void refreshSnapshot()
  }, 2500)

  return () => {
    isActive = false
    clearReconnectTimer()
    clearFallbackPoll()
    void cleanupChannel()
  }
}

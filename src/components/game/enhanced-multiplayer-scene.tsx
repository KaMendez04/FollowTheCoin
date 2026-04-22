"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GAME_LEVELS } from "@/constants/game-enhanced"
import { AvatarType } from "@/types"
import { CHARACTERS, AVATAR_INFO } from "@/constants"
import {
  RoomPlayer,
  RoomState,
  TurnState,
  syncTurnGameState,
} from "@/src/lib/supabase/room"
import { EnhancedGameState, GameLevel, GameObject } from "@/types/game-enhanced"
import PixelCharacter from "./pixel-character"

interface EnhancedMultiplayerSceneProps {
  roomId: string
  roomState: RoomState | null
  playerName: string
  selectedAvatar: AvatarType
  roomPlayers: RoomPlayer[]
  difficulty: "easy" | "medium" | "hard"
  isCurrentPlayerTurn: boolean
  currentPlayerIndex: number
  turnState: TurnState
  onBack: () => void
  onPlayerFinish: (score: number) => void
}

const OBJECT_SIZES: Record<string, number[]> = {
  star: [28, 36, 44, 52],
  chest: [40, 48, 56],
  bomb: [30, 38, 46],
  heart: [28, 36, 44],
  mushroom: [32, 40, 48],
  ruby: [28, 36, 44],
  lightning: [24, 32, 40],
  key: [32, 40, 48],
  potion: [28, 36, 44],
  fakecoin: [32, 40, 48],
}

function randSize(min: number, max: number, step = 8) {
  const steps = Math.floor((max - min) / step)
  return min + Math.floor(Math.random() * (steps + 1)) * step
}

function getDecoyAnimation(design: string) {
  switch (design) {
    case "star":
      return {
        animate: { rotate: [0, 360], scale: [1, 1.15, 1] },
        transition: {
          rotate: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "linear" as const },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
        },
      }
    case "chest":
      return {
        animate: { y: [0, -4, 0], rotateZ: [-2, 2, -2] },
        transition: { duration: 2 + Math.random() * 1.5, repeat: Infinity, ease: "easeInOut" as const },
      }
    case "bomb":
      return {
        animate: { scale: [1, 1.08, 1], x: [-1, 1, -1] },
        transition: { duration: 0.4 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut" as const },
      }
    case "heart":
      return {
        animate: { scale: [1, 1.2, 1] },
        transition: { duration: 0.8 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" as const },
      }
    case "mushroom":
      return {
        animate: { y: [0, -6, 0], rotateZ: [-3, 3, -3] },
        transition: { duration: 1.8 + Math.random(), repeat: Infinity, ease: "easeInOut" as const },
      }
    case "ruby":
      return {
        animate: { rotateY: [0, 180, 360], scale: [1, 1.1, 1] },
        transition: { duration: 2.5 + Math.random(), repeat: Infinity, ease: "easeInOut" as const },
      }
    case "lightning":
      return {
        animate: { opacity: [1, 0.4, 1], scale: [1, 1.12, 1], y: [0, -3, 0] },
        transition: { duration: 0.6 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" as const },
      }
    case "key":
      return {
        animate: { rotate: [-8, 8, -8], y: [0, -3, 0] },
        transition: { duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut" as const },
      }
    case "potion":
      return {
        animate: { scale: [1, 1.08, 1], rotateZ: [-4, 4, -4] },
        transition: { duration: 2.2 + Math.random(), repeat: Infinity, ease: "easeInOut" as const },
      }
    case "fakecoin":
      return {
        animate: { rotateY: [0, 180, 360] },
        transition: { duration: 1.8 + Math.random(), repeat: Infinity, ease: "linear" as const },
      }
    default:
      return {
        animate: { y: [0, -4, 0] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
      }
  }
}

function getCharacterAnimation(type: string) {
  switch (type) {
    case "Mario":
    case "Luigi":
      return {
        animate: { x: [-3, 3, -3], y: [0, -4, 0] },
        transition: { duration: 0.9 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" as const },
      }
    case "Kirby":
      return {
        animate: { scaleX: [1, 1.1, 1], scaleY: [1, 0.92, 1], y: [0, -5, 0] },
        transition: { duration: 1.2 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" as const },
      }
    case "Pikachu":
      return {
        animate: { rotate: [-5, 5, -5], y: [0, -4, 0] },
        transition: { duration: 0.7 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut" as const },
      }
    case "Robot":
      return {
        animate: { y: [0, -3, 0], rotateZ: [-2, 2, -2] },
        transition: { duration: 1.5 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" as const },
      }
    default:
      return {
        animate: { y: [0, -5, 0] },
        transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" as const },
      }
  }
}

function CoinSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="1" width="8" height="1" fill="#facc15" />
      <rect x="3" y="2" width="10" height="1" fill="#facc15" />
      <rect x="2" y="3" width="12" height="3" fill="#facc15" />
      <rect x="1" y="5" width="14" height="5" fill="#facc15" />
      <rect x="2" y="10" width="12" height="2" fill="#facc15" />
      <rect x="3" y="12" width="10" height="1" fill="#facc15" />
      <rect x="4" y="13" width="8" height="1" fill="#facc15" />
      <rect x="5" y="3" width="2" height="9" fill="#fde68a" />
      <rect x="8" y="4" width="2" height="7" fill="#ca8a04" />
      <rect x="3" y="6" width="1" height="3" fill="#fef9c3" />
    </svg>
  )
}

function StarSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect x="7" y="0" width="2" height="3" fill={color} />
      <rect x="7" y="13" width="2" height="3" fill={color} />
      <rect x="0" y="7" width="3" height="2" fill={color} />
      <rect x="13" y="7" width="3" height="2" fill={color} />
      <rect x="2" y="2" width="2" height="2" fill={color} />
      <rect x="12" y="2" width="2" height="2" fill={color} />
      <rect x="2" y="12" width="2" height="2" fill={color} />
      <rect x="12" y="12" width="2" height="2" fill={color} />
      <rect x="5" y="3" width="6" height="2" fill={color} />
      <rect x="3" y="5" width="10" height="6" fill={color} />
      <rect x="5" y="11" width="6" height="2" fill={color} />
      <rect x="7" y="6" width="2" height="4" fill="#fff" opacity={0.5} />
    </svg>
  )
}

function ChestSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.8)} viewBox="0 0 20 16" style={{ imageRendering: "pixelated" }}>
      <rect x="0" y="6" width="20" height="10" fill="#7c3f00" />
      <rect x="1" y="7" width="18" height="8" fill="#a05a2c" />
      <rect x="0" y="4" width="20" height="4" fill="#5c2d00" />
      <rect x="1" y="5" width="18" height="2" fill="#7c3f00" />
      <rect x="0" y="3" width="20" height="2" fill="#facc15" />
      <rect x="8" y="9" width="4" height="3" fill="#facc15" />
      <rect x="9" y="8" width="2" height="5" fill="#facc15" />
      <rect x="2" y="7" width="2" height="2" fill="#ffd700" opacity={0.6} />
      <rect x="16" y="7" width="2" height="2" fill="#ffd700" opacity={0.6} />
      <rect x="0" y="14" width="20" height="2" fill="#5c2d00" />
    </svg>
  )
}

function BombSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 16 18" style={{ imageRendering: "pixelated" }}>
      <rect x="7" y="0" width="2" height="1" fill="#888" />
      <rect x="8" y="1" width="3" height="1" fill="#aaa" />
      <rect x="10" y="0" width="2" height="2" fill="#ff6600" />
      <rect x="4" y="3" width="8" height="1" fill="#222" />
      <rect x="3" y="4" width="10" height="1" fill="#111" />
      <rect x="2" y="5" width="12" height="6" fill="#111" />
      <rect x="3" y="11" width="10" height="1" fill="#111" />
      <rect x="4" y="12" width="8" height="1" fill="#222" />
      <rect x="5" y="13" width="6" height="1" fill="#333" />
      <rect x="4" y="7" width="2" height="2" fill="#555" opacity={0.8} />
      <rect x="10" y="5" width="1" height="1" fill="#666" opacity={0.7} />
    </svg>
  )
}

function HeartSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.88)} viewBox="0 0 16 14" style={{ imageRendering: "pixelated" }}>
      <rect x="1" y="2" width="4" height="1" fill="#e74c3c" />
      <rect x="7" y="2" width="4" height="1" fill="#e74c3c" />
      <rect x="0" y="3" width="6" height="1" fill="#e74c3c" />
      <rect x="6" y="3" width="5" height="1" fill="#e74c3c" />
      <rect x="0" y="4" width="16" height="4" fill="#e74c3c" />
      <rect x="1" y="8" width="14" height="2" fill="#e74c3c" />
      <rect x="2" y="10" width="12" height="1" fill="#e74c3c" />
      <rect x="4" y="11" width="8" height="1" fill="#e74c3c" />
      <rect x="6" y="12" width="4" height="1" fill="#e74c3c" />
      <rect x="1" y="4" width="2" height="2" fill="#ff8080" opacity={0.7} />
      <rect x="7" y="3" width="2" height="2" fill="#ff8080" opacity={0.7} />
    </svg>
  )
}

function MushroomSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect x="3" y="0" width="10" height="1" fill="#cc0000" />
      <rect x="2" y="1" width="12" height="1" fill="#cc0000" />
      <rect x="1" y="2" width="14" height="5" fill="#cc0000" />
      <rect x="2" y="7" width="12" height="2" fill="#cc0000" />
      <rect x="3" y="2" width="3" height="3" fill="#fff" />
      <rect x="10" y="3" width="3" height="3" fill="#fff" />
      <rect x="7" y="1" width="2" height="2" fill="#fff" />
      <rect x="5" y="9" width="6" height="1" fill="#ffc8a0" />
      <rect x="4" y="10" width="8" height="4" fill="#ffc8a0" />
      <rect x="5" y="14" width="2" height="1" fill="#ffc8a0" />
      <rect x="9" y="14" width="2" height="1" fill="#ffc8a0" />
      <rect x="6" y="11" width="4" height="1" fill="#cc9900" opacity={0.5} />
    </svg>
  )
}

function RubySVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="0" width="8" height="1" fill="#ff3366" />
      <rect x="2" y="1" width="12" height="1" fill="#ff3366" />
      <rect x="1" y="2" width="14" height="8" fill="#cc0044" />
      <rect x="2" y="10" width="12" height="2" fill="#cc0044" />
      <rect x="4" y="12" width="8" height="2" fill="#990033" />
      <rect x="6" y="14" width="4" height="1" fill="#660022" />
      <rect x="3" y="3" width="3" height="4" fill="#ff6699" opacity={0.6} />
      <rect x="1" y="2" width="2" height="2" fill="#ff99bb" opacity={0.5} />
    </svg>
  )
}

function LightningSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.4)} viewBox="0 0 12 18" style={{ imageRendering: "pixelated" }}>
      <rect x="5" y="0" width="7" height="1" fill="#facc15" />
      <rect x="4" y="1" width="7" height="1" fill="#facc15" />
      <rect x="3" y="2" width="6" height="1" fill="#fde68a" />
      <rect x="3" y="3" width="5" height="1" fill="#facc15" />
      <rect x="2" y="4" width="7" height="1" fill="#fde68a" />
      <rect x="2" y="5" width="6" height="1" fill="#facc15" />
      <rect x="1" y="6" width="8" height="1" fill="#fde68a" />
      <rect x="3" y="7" width="6" height="1" fill="#facc15" />
      <rect x="4" y="8" width="5" height="1" fill="#fde68a" />
      <rect x="4" y="9" width="4" height="1" fill="#facc15" />
      <rect x="5" y="10" width="4" height="1" fill="#fde68a" />
      <rect x="5" y="11" width="3" height="1" fill="#facc15" />
      <rect x="6" y="12" width="3" height="4" fill="#fde68a" />
      <rect x="5" y="14" width="5" height="1" fill="#facc15" />
    </svg>
  )
}

function KeySVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.6)} viewBox="0 0 18 10" style={{ imageRendering: "pixelated" }}>
      <rect x="0" y="3" width="7" height="4" fill="#fbbf24" />
      <rect x="1" y="2" width="5" height="6" fill="#fbbf24" />
      <rect x="2" y="1" width="3" height="8" fill="#fbbf24" />
      <rect x="3" y="4" width="2" height="2" fill="#050505" />
      <rect x="7" y="4" width="11" height="2" fill="#fbbf24" />
      <rect x="13" y="6" width="2" height="2" fill="#fbbf24" />
      <rect x="15" y="5" width="2" height="2" fill="#fbbf24" />
      <rect x="2" y="2" width="1" height="1" fill="#fde68a" />
    </svg>
  )
}

function PotionSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 12 16" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="0" width="4" height="1" fill="#aaa" />
      <rect x="3" y="1" width="6" height="2" fill="#888" />
      <rect x="1" y="4" width="10" height="1" fill="#6d28d9" />
      <rect x="0" y="5" width="12" height="7" fill="#7c3aed" />
      <rect x="1" y="12" width="10" height="2" fill="#6d28d9" />
      <rect x="2" y="14" width="8" height="1" fill="#5b21b6" />
      <rect x="2" y="6" width="3" height="4" fill="#a78bfa" opacity={0.6} />
      <rect x="1" y="4" width="1" height="1" fill="#c4b5fd" opacity={0.7} />
      <rect x="5" y="3" width="2" height="2" fill="#ddd6fe" opacity={0.5} />
    </svg>
  )
}

function FakeCoinSVG({ size, variant }: { size: number; variant: number }) {
  if (variant === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated", opacity: 0.7 }}>
        <rect x="4" y="1" width="8" height="1" fill="#b45309" />
        <rect x="3" y="2" width="10" height="1" fill="#b45309" />
        <rect x="2" y="3" width="12" height="8" fill="#b45309" />
        <rect x="3" y="11" width="10" height="1" fill="#b45309" />
        <rect x="4" y="12" width="8" height="1" fill="#b45309" />
        <rect x="5" y="4" width="1" height="6" fill="#d97706" />
        <rect x="9" y="4" width="1" height="6" fill="#92400e" />
      </svg>
    )
  }

  if (variant === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated", opacity: 0.6 }}>
        <rect x="4" y="1" width="8" height="1" fill="#9ca3af" />
        <rect x="3" y="2" width="10" height="1" fill="#9ca3af" />
        <rect x="2" y="3" width="12" height="8" fill="#9ca3af" />
        <rect x="3" y="11" width="10" height="1" fill="#9ca3af" />
        <rect x="4" y="12" width="8" height="1" fill="#9ca3af" />
        <rect x="5" y="4" width="1" height="6" fill="#d1d5db" />
        <rect x="9" y="4" width="1" height="6" fill="#6b7280" />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated", opacity: 0.55 }}>
      <rect x="4" y="1" width="8" height="1" fill="#facc15" />
      <rect x="3" y="2" width="10" height="1" fill="#facc15" />
      <rect x="2" y="3" width="12" height="8" fill="#facc15" />
      <rect x="3" y="11" width="10" height="1" fill="#facc15" />
      <rect x="4" y="12" width="8" height="1" fill="#facc15" />
      <rect x="5" y="4" width="1" height="6" fill="#fde68a" />
      <rect x="9" y="4" width="1" height="6" fill="#ca8a04" />
    </svg>
  )
}

function DecoyGraphic({ design, color, size }: { design: string; color: string; size: number }) {
  switch (design) {
    case "star":
      return <StarSVG size={size} color={color} />
    case "chest":
      return <ChestSVG size={size} />
    case "bomb":
      return <BombSVG size={size} />
    case "heart":
      return <HeartSVG size={size} />
    case "mushroom":
      return <MushroomSVG size={size} />
    case "ruby":
      return <RubySVG size={size} />
    case "lightning":
      return <LightningSVG size={size} />
    case "key":
      return <KeySVG size={size} />
    case "potion":
      return <PotionSVG size={size} />
    case "fakecoin":
      return <FakeCoinSVG size={size} variant={Math.floor(Math.random() * 3)} />
    default:
      return <StarSVG size={size} color={color} />
  }
}

type MultiplayerGameMode = "playing" | "watching" | "finished"

type MultiplayerGameState = Omit<EnhancedGameState, "mode"> & {
  mode: MultiplayerGameMode
}

export default function EnhancedMultiplayerScene({
  roomId,
  roomState,
  playerName,
  selectedAvatar,
  roomPlayers,
  difficulty,
  isCurrentPlayerTurn,
  currentPlayerIndex,
  turnState,
  onBack,
  onPlayerFinish,
}: EnhancedMultiplayerSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasSyncedInitialStateRef = useRef(false)
  const finishCalledRef = useRef(false)

  const level = useMemo(
    () => GAME_LEVELS.find((l) => l.difficulty === difficulty) || GAME_LEVELS[0],
    [difficulty]
  )

  const currentPlayer = roomPlayers[currentPlayerIndex]
  const currentPlayerId = currentPlayer?.id ?? ""
  const syncedGameState = roomState?.payload?.gameState as any

  const [gameState, setGameState] = useState<MultiplayerGameState>({
    mode: isCurrentPlayerTurn ? "playing" : "watching",
    level,
    score: 0,
    timeLeft: level.timeLimit,
    playerCharacter: selectedAvatar,
    playerName,
    objects: [] as GameObject[],
    coinPosition: { x: 50, y: 50 },
    coinsCollected: 0,
    gameStartTime: 0,
  })

  const [coinVisible, setCoinVisible] = useState(true)
  const [mouse, setMouse] = useState({ x: 0, y: 0, active: false })
  const [isTransitioning, setIsTransitioning] = useState(false)

  const floatingParticles = useMemo(
    () =>
      [...Array(24)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        color: ["#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#2ecc71", "#ffffff"][
          Math.floor(Math.random() * 6)
        ],
        duration: 4 + Math.random() * 4,
        delay: 1 + Math.random() * 4,
        size: 3 + Math.random() * 4,
      })),
    []
  )

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true })
  }, [])

  const generateCoinPosition = useCallback(() => {
    return { x: 12 + Math.random() * 74, y: 18 + Math.random() * 62 }
  }, [])

  const generateGameObjects = useCallback(
    (currentLevel: GameLevel, coinPos: { x: number; y: number }) => {
      const objects: GameObject[] = []

      objects.push({
        id: "player",
        type: "character",
        x: 10 + Math.random() * 15,
        y: 15 + Math.random() * 60,
        character: selectedAvatar,
        color: AVATAR_INFO[selectedAvatar].color,
      })

      objects.push({
        id: "coin",
        type: "coin",
        x: coinPos.x,
        y: coinPos.y,
        collected: false,
      })

      const others = CHARACTERS.filter((c) => c.type !== selectedAvatar)
      const decoyCharCount =
        currentLevel.difficulty === "easy"
          ? 2
          : currentLevel.difficulty === "medium"
          ? 3
          : 4

      for (let i = 0; i < Math.min(decoyCharCount, others.length); i++) {
        const ch = others[i]
        objects.push({
          id: `decoy-char-${i}`,
          type: "character",
          x: 15 + Math.random() * 78,
          y: 15 + Math.random() * 72,
          character: ch.type,
          color: ch.color,
        })
      }

      const itemDesigns = ["star", "chest", "bomb", "heart", "mushroom", "ruby", "lightning", "key", "potion", "fakecoin"]
      const itemColors: Record<string, string> = {
        star: ["#facc15", "#e74c3c", "#3498db", "#9b59b6", "#2ecc71"][Math.floor(Math.random() * 5)],
        chest: "#a05a2c",
        bomb: "#111",
        heart: "#e74c3c",
        mushroom: "#cc0000",
        ruby: "#cc0044",
        lightning: "#facc15",
        key: "#fbbf24",
        potion: "#7c3aed",
        fakecoin: "#facc15",
      }

      const remaining = currentLevel.objectCount - objects.length

      for (let i = 0; i < remaining; i++) {
        const design = itemDesigns[Math.floor(Math.random() * itemDesigns.length)]
        const size = randSize(
          design === "star" ? 24 : design === "chest" ? 36 : 22,
          design === "star" ? 56 : design === "chest" ? 60 : 52,
          8
        )

        objects.push({
          id: `decoy-${i}`,
          type: "decoy",
          x: 5 + Math.random() * 88,
          y: 12 + Math.random() * 78,
          character: design,
          color: itemColors[design] ?? "#facc15",
          design,
          _size: size,
        })
      }

      return objects
    },
    [selectedAvatar]
  )

  const pushGameStateToRoom = useCallback(
    async (nextState: {
      score: number
      timeLeft: number
      objects: GameObject[]
      coinPosition: { x: number; y: number }
      coinsCollected: number
      startedAt?: number
    }) => {
      if (!roomId || !currentPlayerId || !isCurrentPlayerTurn) return

      try {
        await syncTurnGameState(roomId, {
          score: nextState.score,
          timeLeft: nextState.timeLeft,
          objects: nextState.objects,
          coinPosition: nextState.coinPosition,
          coinsCollected: nextState.coinsCollected,
          activePlayerId: currentPlayerId,
          startedAt: nextState.startedAt ?? gameState.gameStartTime ?? Date.now(),
        })
      } catch (error) {
        console.error("Error sincronizando estado del turno:", error)
      }
    },
    [roomId, currentPlayerId, isCurrentPlayerTurn, gameState.gameStartTime]
  )

  useEffect(() => {
    hasSyncedInitialStateRef.current = false
    finishCalledRef.current = false
    setIsTransitioning(true)

    const timeout = setTimeout(() => {
      setIsTransitioning(false)
    }, 800)

    return () => clearTimeout(timeout)
  }, [currentPlayerIndex])

  useEffect(() => {
    const currentTurnScore = turnState.scores[currentPlayerId] ?? 0

    if (isCurrentPlayerTurn) {
      if (!hasSyncedInitialStateRef.current) {
        const initialCoin = generateCoinPosition()
        const initialObjects = generateGameObjects(level, initialCoin)
        const startTime = Date.now()

        const nextState = {
          mode: "playing" as const,
          level,
          score: 0,
          timeLeft: level.timeLimit,
          playerCharacter: selectedAvatar,
          playerName,
          objects: initialObjects,
          coinPosition: initialCoin,
          coinsCollected: 0,
          gameStartTime: startTime,
        }

        setGameState(nextState)
        setCoinVisible(true)
        hasSyncedInitialStateRef.current = true

        void pushGameStateToRoom({
          score: 0,
          timeLeft: level.timeLimit,
          objects: initialObjects,
          coinPosition: initialCoin,
          coinsCollected: 0,
          startedAt: startTime,
        })
      }
    } else if (syncedGameState && syncedGameState.activePlayerId === currentPlayerId) {
      setGameState({
        mode: "watching",
        level,
        score: syncedGameState.score ?? currentTurnScore,
        timeLeft: syncedGameState.timeLeft ?? level.timeLimit,
        playerCharacter: selectedAvatar,
        playerName,
        objects: syncedGameState.objects ?? [],
        coinPosition: syncedGameState.coinPosition ?? { x: 50, y: 50 },
        coinsCollected: syncedGameState.coinsCollected ?? currentTurnScore,
        gameStartTime: syncedGameState.startedAt ?? Date.now(),
      })
      setCoinVisible(true)
    } else {
      setGameState((prev) => ({
        ...prev,
        mode: "watching",
        score: currentTurnScore,
        coinsCollected: currentTurnScore,
        timeLeft: level.timeLimit,
      }))
    }
  }, [
    isCurrentPlayerTurn,
    syncedGameState,
    currentPlayerId,
    level,
    playerName,
    selectedAvatar,
    turnState.scores,
    roomId,
    generateCoinPosition,
    generateGameObjects,
    pushGameStateToRoom,
  ])

  useEffect(() => {
    if (!syncedGameState) return
    if (isCurrentPlayerTurn) return
    if (syncedGameState.activePlayerId !== currentPlayerId) return

    setGameState((prev) => ({
      ...prev,
      mode: "watching",
      score: syncedGameState.score ?? prev.score,
      timeLeft: syncedGameState.timeLeft ?? prev.timeLeft,
      objects: syncedGameState.objects ?? prev.objects,
      coinPosition: syncedGameState.coinPosition ?? prev.coinPosition,
      coinsCollected: syncedGameState.coinsCollected ?? prev.coinsCollected,
      gameStartTime: syncedGameState.startedAt ?? prev.gameStartTime,
    }))
  }, [syncedGameState, isCurrentPlayerTurn, currentPlayerId])

  useEffect(() => {
    if (!isCurrentPlayerTurn) return
    if (gameState.mode !== "playing") return

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          return {
            ...prev,
            timeLeft: 0,
            mode: "finished" as const,
          }
        }

        const nextState = {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }

        void pushGameStateToRoom({
          score: nextState.score,
          timeLeft: nextState.timeLeft,
          objects: nextState.objects,
          coinPosition: nextState.coinPosition,
          coinsCollected: nextState.coinsCollected,
        })

        return nextState
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.mode, isCurrentPlayerTurn, pushGameStateToRoom])

  useEffect(() => {
    if (gameState.mode === "finished" && isCurrentPlayerTurn && !finishCalledRef.current) {
      finishCalledRef.current = true
      onPlayerFinish(gameState.score)
    }
  }, [gameState.mode, gameState.score, isCurrentPlayerTurn, onPlayerFinish])

  const handleCoinClick = useCallback(() => {
    if (!isCurrentPlayerTurn) return
    if (gameState.mode !== "playing") return

    setCoinVisible(false)
    const newPos = generateCoinPosition()

    setGameState((prev) => {
      const updatedObjects = prev.objects.map((o) =>
        o.id === "coin" ? { ...o, x: newPos.x, y: newPos.y } : o
      )

      const nextState = {
        ...prev,
        score: prev.score + 1,
        coinsCollected: prev.coinsCollected + 1,
        coinPosition: newPos,
        objects: updatedObjects,
      }

      void pushGameStateToRoom({
        score: nextState.score,
        timeLeft: nextState.timeLeft,
        objects: nextState.objects,
        coinPosition: nextState.coinPosition,
        coinsCollected: nextState.coinsCollected,
      })

      return nextState
    })

    setTimeout(() => setCoinVisible(true), 120)
  }, [gameState.mode, generateCoinPosition, isCurrentPlayerTurn, pushGameStateToRoom])

  const handleDecoyClick = useCallback(() => {
    if (!isCurrentPlayerTurn) return
    if (gameState.mode !== "playing") return

    setGameState((prev) => {
      const nextState = {
        ...prev,
        score: Math.max(0, prev.score - 1),
      }

      void pushGameStateToRoom({
        score: nextState.score,
        timeLeft: nextState.timeLeft,
        objects: nextState.objects,
        coinPosition: nextState.coinPosition,
        coinsCollected: nextState.coinsCollected,
      })

      return nextState
    })
  }, [gameState.mode, isCurrentPlayerTurn, pushGameStateToRoom])

  const renderObject = (object: GameObject) => {
    if (object.type === "coin") {
      const coinSize =
        gameState.level.difficulty === "hard"
          ? 36
          : gameState.level.difficulty === "medium"
          ? 44
          : 50

      return (
        <AnimatePresence key={`coin-${object.id}`}>
          {coinVisible && (
            <motion.div
              key="coin-present"
              className={`absolute ${isCurrentPlayerTurn ? "cursor-pointer" : "cursor-default"}`}
              style={{
                left: `${object.x}%`,
                top: `${object.y}%`,
                transform: "translate(-50%,-50%)",
                zIndex: 22,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.08, 1], opacity: 1, y: [0, -5, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.1 },
              }}
              whileTap={isCurrentPlayerTurn ? { scale: 0.85 } : undefined}
              onClick={handleCoinClick}
            >
              <CoinSVG size={coinSize} />
            </motion.div>
          )}
        </AnimatePresence>
      )
    }

    if (object.type === "character") {
      const isPlayer = object.id === "player"
      const charAnim = getCharacterAnimation(object.character ?? "")

      return (
        <motion.div
          key={object.id}
          className="absolute"
          style={{
            left: `${object.x}%`,
            top: `${object.y}%`,
            transform: "translate(-50%,-50%)",
            zIndex: isPlayer ? 18 : 15,
            pointerEvents: "none",
            filter: isPlayer ? `drop-shadow(0 0 5px ${object.color})` : undefined,
          }}
          animate={charAnim.animate}
          transition={charAnim.transition}
        >
          <PixelCharacter type={object.character ?? ""} delay={0} />

          {isPlayer && (
            <motion.div
              className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold whitespace-nowrap px-1 rounded"
              style={{ color: object.color, textShadow: "0 0 4px #000", fontFamily: "monospace" }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ▲ TÚ
            </motion.div>
          )}
        </motion.div>
      )
    }

    if (object.type === "decoy") {
      const decoyAnim = getDecoyAnimation(object.design ?? "")
      const size: number = object._size ?? randSize(24, 48, 8)

      return (
        <motion.div
          key={object.id}
          className={`absolute ${isCurrentPlayerTurn ? "cursor-pointer" : "cursor-default"}`}
          style={{
            left: `${object.x}%`,
            top: `${object.y}%`,
            transform: "translate(-50%,-50%)",
            zIndex: 12,
          }}
          animate={decoyAnim.animate}
          transition={decoyAnim.transition}
          whileTap={isCurrentPlayerTurn ? { scale: 0.85 } : undefined}
          onClick={handleDecoyClick}
        >
          <DecoyGraphic design={object.design ?? ""} color={object.color ?? "#facc15"} size={size} />
        </motion.div>
      )
    }

    return null
  }

  const getCurrentPlayer = () => {
    return roomPlayers[currentPlayerIndex]
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse((p) => ({ ...p, active: false }))}
      className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-6"
      style={{ imageRendering: "pixelated" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10"
            style={{ left: `${6 + ((i * 6.1) % 90)}%`, top: `${4 + ((i * 7.3) % 88)}%` }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ imageRendering: "pixelated" }}>
              <rect x="5" y="0" width="2" height="12" fill="#fff" />
              <rect x="0" y="5" width="12" height="2" fill="#fff" />
            </svg>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {floatingParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: p.color,
            }}
            animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      <AnimatePresence>
        {mouse.active && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ left: mouse.x - 8, top: mouse.y - 8, width: 16, height: 16, zIndex: 10 }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full h-full bg-white/20 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-30">
        <div
          className="bg-black/75 backdrop-blur-sm rounded-xl px-5 py-2 border border-white/10 flex items-center gap-5"
          style={{ imageRendering: "pixelated" }}
        >
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-base" style={{ fontFamily: "monospace" }}>
              {gameState.coinsCollected}
            </div>
            <div className="text-white/40 text-[10px]">Monedas</div>
          </div>

          <div className="w-px h-6 bg-white/10" />

          <div className="text-center">
            <div className="text-white font-bold text-base" style={{ fontFamily: "monospace" }}>
              {gameState.score}
            </div>
            <div className="text-white/40 text-[10px]">Puntos</div>
          </div>

          <div className="w-px h-6 bg-white/10" />

          <div className="text-center">
            <div
              className={`font-bold text-xl ${gameState.timeLeft <= 10 ? "text-red-400" : "text-white"}`}
              style={{ fontFamily: "monospace" }}
            >
              {gameState.timeLeft}s
            </div>
            <div className="text-white/40 text-[10px]">Tiempo</div>
          </div>

          <div className="w-px h-6 bg-white/10" />

          <div className="text-center">
            <div className="text-white font-bold text-xs" style={{ fontFamily: "monospace" }}>
              {gameState.level.name}
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 z-30"
        style={{ imageRendering: "pixelated" }}
      >
        <div className="text-center mb-2">
          <div className="text-white font-bold text-sm">
            {isCurrentPlayerTurn ? "Tu turno" : `Observando a ${getCurrentPlayer()?.nickname || "Jugador"}`}
          </div>
          <div className="text-yellow-300 text-xs">
            Turno {currentPlayerIndex + 1} de {roomPlayers.length}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-white/70 text-xs mb-1">Jugadores:</div>

          {roomPlayers.map((player, index) => (
            <div key={player.id} className="flex items-center gap-2 text-xs">
              <div
                className="w-4 h-4 rounded border border-white/30 overflow-hidden"
                title={AVATAR_INFO[player.avatar as keyof typeof AVATAR_INFO]?.label || player.avatar || "?"}
              >
                {player.avatar === "Mage" ? (
                  <img src="/mage.png" alt="Mage" className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }} />
                ) : player.avatar === "Pikachu" ? (
                  <img src="/pikachu.png" alt="Pikachu" className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }} />
                ) : player.avatar === "Mario" ? (
                  <img src="/mario.png" alt="Mario" className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }} />
                ) : player.avatar === "Luigi" ? (
                  <img src="/luigi.png" alt="Luigi" className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }} />
                ) : player.avatar === "Robot" ? (
                  <img src="/robot.png" alt="Robot" className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }} />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: AVATAR_INFO[player.avatar as keyof typeof AVATAR_INFO]?.color || "#666" }}
                  >
                    {(player.avatar || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>

              <span className={index === currentPlayerIndex ? "text-yellow-300 font-semibold" : "text-white/70"}>
                {player.nickname} {index === currentPlayerIndex ? "←" : ""}
              </span>

              {turnState.scores[player.id] !== undefined && (
                <span className="text-white/50">({turnState.scores[player.id]} pts)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full h-[calc(100vh-6rem)] max-w-6xl mx-auto" style={{ zIndex: 5 }}>
        {gameState.objects.map((obj) => (
          <div key={obj.id}>{renderObject(obj)}</div>
        ))}
      </div>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-25"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/10 border border-white/20 rounded-2xl p-8 text-center"
            >
              <div className="text-2xl font-black text-yellow-400 mb-2" style={{ fontFamily: "monospace" }}>
                🔄 Cambiando turno...
              </div>
              <div className="text-white/70 text-sm" style={{ fontFamily: "monospace" }}>
                {getCurrentPlayer()?.nickname} está jugando
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isCurrentPlayerTurn && gameState.mode === "watching" && !isTransitioning && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-6 py-3 text-center">
            <div className="text-yellow-400 font-bold text-sm mb-1">
              📺 Observando a {getCurrentPlayer()?.nickname}
            </div>
            <div className="text-white/70 text-xs">
              Turno {currentPlayerIndex + 1} de {roomPlayers.length} • Espera tu turno
            </div>
          </div>
        </div>
      )}

      {gameState.mode === "finished" && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4">
            <h3
              className="text-3xl font-black text-center mb-3"
              style={{ fontFamily: "monospace", imageRendering: "pixelated" }}
            >
              ¡Turno Terminado!
            </h3>

            <div
              className="text-2xl text-yellow-400 font-bold mb-1"
              style={{ fontFamily: "monospace", imageRendering: "pixelated" }}
            >
              {gameState.score} pts
            </div>

            <div className="text-white/60 text-sm mb-4" style={{ imageRendering: "pixelated" }}>
              {gameState.coinsCollected} monedas encontradas
            </div>

            <div className="text-white/70 text-sm mb-2">Progreso del juego:</div>

            <div className="text-white/50 text-xs mb-4">
              {turnState.finished_players.length} de {roomPlayers.length} jugadores han terminado
            </div>

            <div className="text-white/60 text-sm">
              Esperando que todos los jugadores terminen para ver el ranking...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
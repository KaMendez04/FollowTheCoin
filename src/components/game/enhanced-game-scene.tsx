"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameMode, GameObject, EnhancedGameState, GameLevel } from "@/types/game-enhanced"
import { GAME_LEVELS, DECOY_OBJECTS, GAME_CONFIG_ENHANCED } from "@/constants/game-enhanced"
import { AvatarType } from "@/types"
import { CHARACTERS, AVATAR_INFO } from "@/constants"
import PixelCharacter from "./pixel-character"

interface EnhancedGameSceneProps {
  playerName: string
  selectedAvatar: AvatarType
  onBack: () => void
}

// ─── Tamaños variados por objeto ────────────────────────────────────────────
const OBJECT_SIZES: Record<string, number> = {
  star:       [28, 36, 44, 52][Math.floor(Math.random() * 4)],
  chest:      [40, 48, 56][Math.floor(Math.random() * 3)],
  bomb:       [30, 38, 46][Math.floor(Math.random() * 3)],
  heart:      [28, 36, 44][Math.floor(Math.random() * 3)],
  mushroom:   [32, 40, 48][Math.floor(Math.random() * 3)],
  ruby:       [28, 36, 44][Math.floor(Math.random() * 3)],
  lightning:  [24, 32, 40][Math.floor(Math.random() * 3)],
  key:        [32, 40, 48][Math.floor(Math.random() * 3)],
  potion:     [28, 36, 44][Math.floor(Math.random() * 3)],
  fakecoin:   [32, 40, 48][Math.floor(Math.random() * 3)],
}

function randSize(min: number, max: number, step = 8) {
  const steps = Math.floor((max - min) / step)
  return min + Math.floor(Math.random() * (steps + 1)) * step
}

// ─── Animations per decoy type ──────────────────────────────────────────────
function getDecoyAnimation(design: string) {
  switch (design) {
    case "star":
      return {
        animate: { rotate: [0, 360], scale: [1, 1.15, 1] },
        transition: { rotate: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "linear" as any }, scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as any } },
      }
    case "chest":
      return {
        animate: { y: [0, -4, 0], rotateZ: [-2, 2, -2] },
        transition: { duration: 2 + Math.random() * 1.5, repeat: Infinity, ease: "easeInOut" as any },
      }
    case "bomb":
      return {
        animate: { scale: [1, 1.08, 1], x: [-1, 1, -1] },
        transition: { duration: 0.4 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut" as any },
      }
    case "heart":
      return {
        animate: { scale: [1, 1.2, 1] },
        transition: { duration: 0.8 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" as any },
      }
    case "mushroom":
      return {
        animate: { y: [0, -6, 0], rotateZ: [-3, 3, -3] },
        transition: { duration: 1.8 + Math.random(), repeat: Infinity, ease: "easeInOut" as any },
      }
    case "ruby":
      return {
        animate: { rotateY: [0, 180, 360], scale: [1, 1.1, 1] },
        transition: { duration: 2.5 + Math.random(), repeat: Infinity, ease: "easeInOut" as any },
      }
    case "lightning":
      return {
        animate: { opacity: [1, 0.4, 1], scale: [1, 1.12, 1], y: [0, -3, 0] },
        transition: { duration: 0.6 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" as any },
      }
    case "key":
      return {
        animate: { rotate: [-8, 8, -8], y: [0, -3, 0] },
        transition: { duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut" as any },
      }
    case "potion":
      return {
        animate: { scale: [1, 1.08, 1], rotateZ: [-4, 4, -4] },
        transition: { duration: 2.2 + Math.random(), repeat: Infinity, ease: "easeInOut" as any },
      }
    case "fakecoin":
      return {
        animate: { rotateY: [0, 180, 360] },
        transition: { duration: 1.8 + Math.random(), repeat: Infinity, ease: "linear" as any },
      }
    default:
      return {
        animate: { y: [0, -4, 0] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as any },
      }
  }
}

function getCharacterAnimation(type: string) {
  switch (type) {
    case "Mario":
    case "Luigi":
      return {
        animate: { x: [-3, 3, -3], y: [0, -4, 0] },
        transition: { duration: 0.9 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" as any },
      }
    case "Kirby":
      return {
        animate: { scaleX: [1, 1.1, 1], scaleY: [1, 0.92, 1], y: [0, -5, 0] },
        transition: { duration: 1.2 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" as any },
      }
    case "Pikachu":
      return {
        animate: { rotate: [-5, 5, -5], y: [0, -4, 0] },
        transition: { duration: 0.7 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut" as any },
      }
    case "Robot":
      return {
        animate: { y: [0, -3, 0], rotateZ: [-2, 2, -2] },
        transition: { duration: 1.5 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" as any },
      }
    default:
      return {
        animate: { y: [0, -5, 0] },
        transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" as any },
      }
  }
}

// ─── Coin SVG ────────────────────────────────────────────────────────────────
function CoinSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="1" width="8" height="1" fill="#facc15"/>
      <rect x="3" y="2" width="10" height="1" fill="#facc15"/>
      <rect x="2" y="3" width="12" height="3" fill="#facc15"/>
      <rect x="1" y="5" width="14" height="5" fill="#facc15"/>
      <rect x="2" y="10" width="12" height="2" fill="#facc15"/>
      <rect x="3" y="12" width="10" height="1" fill="#facc15"/>
      <rect x="4" y="13" width="8" height="1" fill="#facc15"/>
      <rect x="5" y="3" width="2" height="9" fill="#fde68a"/>
      <rect x="8" y="4" width="2" height="7" fill="#ca8a04"/>
      <rect x="3" y="6" width="1" height="3" fill="#fef9c3"/>
    </svg>
  )
}

// ─── Decoy SVGs ──────────────────────────────────────────────────────────────
function StarSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect x="7" y="0" width="2" height="3" fill={color}/>
      <rect x="7" y="13" width="2" height="3" fill={color}/>
      <rect x="0" y="7" width="3" height="2" fill={color}/>
      <rect x="13" y="7" width="3" height="2" fill={color}/>
      <rect x="2" y="2" width="2" height="2" fill={color}/>
      <rect x="12" y="2" width="2" height="2" fill={color}/>
      <rect x="2" y="12" width="2" height="2" fill={color}/>
      <rect x="12" y="12" width="2" height="2" fill={color}/>
      <rect x="5" y="3" width="6" height="2" fill={color}/>
      <rect x="3" y="5" width="10" height="6" fill={color}/>
      <rect x="5" y="11" width="6" height="2" fill={color}/>
      <rect x="7" y="6" width="2" height="4" fill="#fff" opacity={0.5}/>
    </svg>
  )
}

function ChestSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.8)} viewBox="0 0 20 16" style={{ imageRendering: "pixelated" }}>
      <rect x="0" y="6" width="20" height="10" fill="#7c3f00"/>
      <rect x="1" y="7" width="18" height="8" fill="#a05a2c"/>
      <rect x="0" y="4" width="20" height="4" fill="#5c2d00"/>
      <rect x="1" y="5" width="18" height="2" fill="#7c3f00"/>
      <rect x="0" y="3" width="20" height="2" fill="#facc15"/>
      <rect x="8" y="9" width="4" height="3" fill="#facc15"/>
      <rect x="9" y="8" width="2" height="5" fill="#facc15"/>
      <rect x="2" y="7" width="2" height="2" fill="#ffd700" opacity={0.6}/>
      <rect x="16" y="7" width="2" height="2" fill="#ffd700" opacity={0.6}/>
      <rect x="0" y="14" width="20" height="2" fill="#5c2d00"/>
    </svg>
  )
}

function BombSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 16 18" style={{ imageRendering: "pixelated" }}>
      <rect x="7" y="0" width="2" height="1" fill="#888"/>
      <rect x="8" y="1" width="3" height="1" fill="#aaa"/>
      <rect x="10" y="0" width="2" height="2" fill="#ff6600"/>
      <rect x="4" y="3" width="8" height="1" fill="#222"/>
      <rect x="3" y="4" width="10" height="1" fill="#111"/>
      <rect x="2" y="5" width="12" height="6" fill="#111"/>
      <rect x="3" y="11" width="10" height="1" fill="#111"/>
      <rect x="4" y="12" width="8" height="1" fill="#222"/>
      <rect x="5" y="13" width="6" height="1" fill="#333"/>
      <rect x="4" y="7" width="2" height="2" fill="#555" opacity={0.8}/>
      <rect x="10" y="5" width="1" height="1" fill="#666" opacity={0.7}/>
    </svg>
  )
}

function HeartSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.88)} viewBox="0 0 16 14" style={{ imageRendering: "pixelated" }}>
      <rect x="1" y="2" width="4" height="1" fill="#e74c3c"/>
      <rect x="7" y="2" width="4" height="1" fill="#e74c3c"/>
      <rect x="0" y="3" width="6" height="1" fill="#e74c3c"/>
      <rect x="6" y="3" width="5" height="1" fill="#e74c3c"/>
      <rect x="0" y="4" width="16" height="4" fill="#e74c3c"/>
      <rect x="1" y="8" width="14" height="2" fill="#e74c3c"/>
      <rect x="2" y="10" width="12" height="1" fill="#e74c3c"/>
      <rect x="4" y="11" width="8" height="1" fill="#e74c3c"/>
      <rect x="6" y="12" width="4" height="1" fill="#e74c3c"/>
      <rect x="1" y="4" width="2" height="2" fill="#ff8080" opacity={0.7}/>
      <rect x="7" y="3" width="2" height="2" fill="#ff8080" opacity={0.7}/>
    </svg>
  )
}

function MushroomSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect x="3" y="0" width="10" height="1" fill="#cc0000"/>
      <rect x="2" y="1" width="12" height="1" fill="#cc0000"/>
      <rect x="1" y="2" width="14" height="5" fill="#cc0000"/>
      <rect x="2" y="7" width="12" height="2" fill="#cc0000"/>
      <rect x="3" y="2" width="3" height="3" fill="#fff"/>
      <rect x="10" y="3" width="3" height="3" fill="#fff"/>
      <rect x="7" y="1" width="2" height="2" fill="#fff"/>
      <rect x="5" y="9" width="6" height="1" fill="#ffc8a0"/>
      <rect x="4" y="10" width="8" height="4" fill="#ffc8a0"/>
      <rect x="5" y="14" width="2" height="1" fill="#ffc8a0"/>
      <rect x="9" y="14" width="2" height="1" fill="#ffc8a0"/>
      <rect x="6" y="11" width="4" height="1" fill="#cc9900" opacity={0.5}/>
    </svg>
  )
}

function RubySVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="0" width="8" height="1" fill="#ff3366"/>
      <rect x="2" y="1" width="12" height="1" fill="#ff3366"/>
      <rect x="1" y="2" width="14" height="8" fill="#cc0044"/>
      <rect x="2" y="10" width="12" height="2" fill="#cc0044"/>
      <rect x="4" y="12" width="8" height="2" fill="#990033"/>
      <rect x="6" y="14" width="4" height="1" fill="#660022"/>
      <rect x="3" y="3" width="3" height="4" fill="#ff6699" opacity={0.6}/>
      <rect x="1" y="2" width="2" height="2" fill="#ff99bb" opacity={0.5}/>
    </svg>
  )
}

function LightningSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.4)} viewBox="0 0 12 18" style={{ imageRendering: "pixelated" }}>
      <rect x="5" y="0" width="7" height="1" fill="#facc15"/>
      <rect x="4" y="1" width="7" height="1" fill="#facc15"/>
      <rect x="3" y="2" width="6" height="1" fill="#fde68a"/>
      <rect x="3" y="3" width="5" height="1" fill="#facc15"/>
      <rect x="2" y="4" width="7" height="1" fill="#fde68a"/>
      <rect x="2" y="5" width="6" height="1" fill="#facc15"/>
      <rect x="1" y="6" width="8" height="1" fill="#fde68a"/>
      <rect x="3" y="7" width="6" height="1" fill="#facc15"/>
      <rect x="4" y="8" width="5" height="1" fill="#fde68a"/>
      <rect x="4" y="9" width="4" height="1" fill="#facc15"/>
      <rect x="5" y="10" width="4" height="1" fill="#fde68a"/>
      <rect x="5" y="11" width="3" height="1" fill="#facc15"/>
      <rect x="6" y="12" width="3" height="4" fill="#fde68a"/>
      <rect x="5" y="14" width="5" height="1" fill="#facc15"/>
    </svg>
  )
}

function KeySVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.6)} viewBox="0 0 18 10" style={{ imageRendering: "pixelated" }}>
      <rect x="0" y="3" width="7" height="4" fill="#fbbf24"/>
      <rect x="1" y="2" width="5" height="6" fill="#fbbf24"/>
      <rect x="2" y="1" width="3" height="8" fill="#fbbf24"/>
      <rect x="3" y="4" width="2" height="2" fill="#050505"/>
      <rect x="7" y="4" width="11" height="2" fill="#fbbf24"/>
      <rect x="13" y="6" width="2" height="2" fill="#fbbf24"/>
      <rect x="15" y="5" width="2" height="2" fill="#fbbf24"/>
      <rect x="2" y="2" width="1" height="1" fill="#fde68a"/>
    </svg>
  )
}

function PotionSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 12 16" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="0" width="4" height="1" fill="#aaa"/>
      <rect x="3" y="1" width="6" height="2" fill="#888"/>
      <rect x="1" y="4" width="10" height="1" fill="#6d28d9"/>
      <rect x="0" y="5" width="12" height="7" fill="#7c3aed"/>
      <rect x="1" y="12" width="10" height="2" fill="#6d28d9"/>
      <rect x="2" y="14" width="8" height="1" fill="#5b21b6"/>
      <rect x="2" y="6" width="3" height="4" fill="#a78bfa" opacity={0.6}/>
      <rect x="1" y="4" width="1" height="1" fill="#c4b5fd" opacity={0.7}/>
      <rect x="5" y="3" width="2" height="2" fill="#ddd6fe" opacity={0.5}/>
    </svg>
  )
}

function FakeCoinSVG({ size, variant }: { size: number; variant: number }) {
  if (variant === 0) return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated", opacity: 0.7 }}>
      <rect x="4" y="1" width="8" height="1" fill="#b45309"/>
      <rect x="3" y="2" width="10" height="1" fill="#b45309"/>
      <rect x="2" y="3" width="12" height="8" fill="#b45309"/>
      <rect x="3" y="11" width="10" height="1" fill="#b45309"/>
      <rect x="4" y="12" width="8" height="1" fill="#b45309"/>
      <rect x="5" y="4" width="1" height="6" fill="#d97706"/>
      <rect x="9" y="4" width="1" height="6" fill="#92400e"/>
    </svg>
  )
  if (variant === 1) return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated", opacity: 0.6 }}>
      <rect x="4" y="1" width="8" height="1" fill="#9ca3af"/>
      <rect x="3" y="2" width="10" height="1" fill="#9ca3af"/>
      <rect x="2" y="3" width="12" height="8" fill="#9ca3af"/>
      <rect x="3" y="11" width="10" height="1" fill="#9ca3af"/>
      <rect x="4" y="12" width="8" height="1" fill="#9ca3af"/>
      <rect x="5" y="4" width="1" height="6" fill="#d1d5db"/>
      <rect x="9" y="4" width="1" height="6" fill="#6b7280"/>
    </svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated", opacity: 0.55 }}>
      <rect x="4" y="1" width="8" height="1" fill="#facc15"/>
      <rect x="3" y="2" width="10" height="1" fill="#facc15"/>
      <rect x="2" y="3" width="12" height="8" fill="#facc15"/>
      <rect x="3" y="11" width="10" height="1" fill="#facc15"/>
      <rect x="4" y="12" width="8" height="1" fill="#facc15"/>
      <rect x="5" y="4" width="1" height="6" fill="#fde68a"/>
      <rect x="9" y="4" width="1" height="6" fill="#ca8a04"/>
    </svg>
  )
}

// ─── Render decoy by design type ────────────────────────────────────────────
function DecoyGraphic({ design, color, size }: { design: string; color: string; size: number }) {
  switch (design) {
    case "star": return <StarSVG size={size} color={color} />
    case "chest": return <ChestSVG size={size} />
    case "bomb": return <BombSVG size={size} />
    case "heart": return <HeartSVG size={size} />
    case "mushroom": return <MushroomSVG size={size} />
    case "ruby": return <RubySVG size={size} />
    case "lightning": return <LightningSVG size={size} />
    case "key": return <KeySVG size={size} />
    case "potion": return <PotionSVG size={size} />
    case "fakecoin": return <FakeCoinSVG size={size} variant={Math.floor(Math.random() * 3)} />
    default: return <StarSVG size={size} color={color} />
  }
}

export default function EnhancedGameScene({ playerName, selectedAvatar, onBack }: EnhancedGameSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<EnhancedGameState>({
    mode: "menu",
    level: GAME_LEVELS[0],
    score: 0,
    timeLeft: GAME_LEVELS[0].timeLimit,
    playerCharacter: selectedAvatar,
    playerName: playerName,
    objects: [],
    coinPosition: { x: 50, y: 50 },
    coinsCollected: 0,
    gameStartTime: 0,
  })

  const [coinVisible, setCoinVisible] = useState(true)
  const [mouse, setMouse] = useState({ x: 0, y: 0, active: false })

  const floatingParticles = useMemo(
    () =>
      [...Array(24)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        color: ["#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#2ecc71", "#ffffff"][Math.floor(Math.random() * 6)],
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

  const generateCoinPosition = useCallback(
    () => ({ x: 12 + Math.random() * 74, y: 18 + Math.random() * 62 }),
    []
  )

  const generateGameObjects = useCallback(
    (level: GameLevel, coinPos: { x: number; y: number }) => {
      const objects: GameObject[] = []

      // Player character
      objects.push({
        id: "player",
        type: "character",
        x: 10 + Math.random() * 15,
        y: 15 + Math.random() * 60,
        character: selectedAvatar,
        color: AVATAR_INFO[selectedAvatar].color,
      })

      // Coin
      objects.push({ id: "coin", type: "coin", x: coinPos.x, y: coinPos.y, collected: false })

      // Decoy characters
      const others = CHARACTERS.filter((c) => c.type !== selectedAvatar)
      const decoyCharCount = level.difficulty === "easy" ? 2 : level.difficulty === "medium" ? 3 : 4
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

      // Decoy items — varied count and size per difficulty
      const itemDesigns = ["star","chest","bomb","heart","mushroom","ruby","lightning","key","potion","fakecoin"]
      const itemColors: Record<string, string> = {
        star: ["#facc15","#e74c3c","#3498db","#9b59b6","#2ecc71"][Math.floor(Math.random()*5)],
        chest: "#a05a2c", bomb: "#111", heart: "#e74c3c", mushroom: "#cc0000",
        ruby: "#cc0044", lightning: "#facc15", key: "#fbbf24", potion: "#7c3aed",
        fakecoin: "#facc15",
      }
      const remaining = level.objectCount - objects.length
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

  const startGame = useCallback(
    (level: GameLevel) => {
      const coinPosition = generateCoinPosition()
      const objects = generateGameObjects(level, coinPosition)
      setGameState({
        mode: "playing",
        level,
        score: 0,
        timeLeft: level.timeLimit,
        playerCharacter: selectedAvatar,
        playerName,
        objects,
        coinPosition,
        coinsCollected: 0,
        gameStartTime: Date.now(),
      })
      setCoinVisible(true)
    },
    [selectedAvatar, playerName, generateGameObjects, generateCoinPosition]
  )

  // Timer
  useEffect(() => {
    if (gameState.mode !== "playing") return
    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) return { ...prev, timeLeft: 0, mode: "finished" }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameState.mode])

  const handleCoinClick = useCallback(() => {
    if (gameState.mode !== "playing") return
    // Immediately hide coin, then move + show
    setCoinVisible(false)
    const newPos = generateCoinPosition()
    setGameState((prev) => ({
      ...prev,
      score: prev.score + 1,
      coinsCollected: prev.coinsCollected + 1,
      objects: prev.objects.map((o) => (o.id === "coin" ? { ...o, x: newPos.x, y: newPos.y } : o)),
    }))
    setTimeout(() => setCoinVisible(true), 120)
  }, [gameState.mode, generateCoinPosition])

  const handleDecoyClick = useCallback(() => {
    if (gameState.mode !== "playing") return
    setGameState((prev) => ({ ...prev, score: Math.max(0, prev.score - 1) }))
  }, [gameState.mode])

  // ─── Render objects ────────────────────────────────────────────────────────
  const renderObject = (object: GameObject) => {
    if (object.type === "coin") {
      const coinSize = gameState.level.difficulty === "hard" ? 36 : gameState.level.difficulty === "medium" ? 44 : 50
      return (
        <AnimatePresence key={`coin-${object.id}`}>
          {coinVisible && (
            <motion.div
              key="coin-present"
              className="absolute cursor-pointer"
              style={{ left: `${object.x}%`, top: `${object.y}%`, transform: "translate(-50%,-50%)", zIndex: 22 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.08, 1], opacity: 1, y: [0, -5, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.1 },
              }}
              whileTap={{ scale: 0.85 }}
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
      const charSize = gameState.level.difficulty === "hard" ? 38 : 48
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
          className="absolute cursor-pointer"
          style={{ left: `${object.x}%`, top: `${object.y}%`, transform: "translate(-50%,-50%)", zIndex: 12 }}
          animate={decoyAnim.animate}
          transition={decoyAnim.transition}
          whileTap={{ scale: 0.85 }}
          onClick={handleDecoyClick}
        >
          <DecoyGraphic design={object.design ?? ""} color={object.color ?? "#facc15"} size={size} />
        </motion.div>
      )
    }

    return null
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse((p) => ({ ...p, active: false }))}
      className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-6"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Ambient pixel crosses */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10"
            style={{ left: `${6 + (i * 6.1) % 90}%`, top: `${4 + (i * 7.3) % 88}%` }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ imageRendering: "pixelated" }}>
              <rect x="5" y="0" width="2" height="12" fill="#fff"/>
              <rect x="0" y="5" width="12" height="2" fill="#fff"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {floatingParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, background: p.color }}
            animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Mouse trail */}
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

      {/* HUD */}
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

      {/* Game area */}
      <div className="relative w-full h-[calc(100vh-6rem)] max-w-6xl mx-auto" style={{ zIndex: 5 }}>
        {gameState.objects.map((obj) => (
          <div key={obj.id}>{renderObject(obj)}</div>
        ))}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {gameState.mode === "menu" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-4 z-40"
            style={{ imageRendering: "pixelated" }}
          >
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-2"
              style={{ imageRendering: "pixelated" }}
            >
              <h1
                className="text-4xl md:text-5xl font-black text-white mb-2"
                style={{ fontFamily: "monospace", textShadow: "3px 3px 0 #2b2f36", imageRendering: "pixelated" }}
              >
                FOLLOW COIN
              </h1>
              <p className="text-white/60 text-sm" style={{ imageRendering: "pixelated" }}>Toca la moneda dorada · cuidado con los imitadores</p>
              <p className="text-white/30 text-xs mt-1" style={{ imageRendering: "pixelated" }}>Clic en objeto incorrecto = -1 punto</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-4" style={{ imageRendering: "pixelated" }}>
              {GAME_LEVELS.map((level, i) => (
                <motion.button
                  key={level.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startGame(level)}
                  className="border-b-4 border-[#ca8a04] bg-[#fde047] px-6 py-4 font-black text-[#1f2937] shadow-lg min-w-[160px]"
                  style={{ fontFamily: "monospace", imageRendering: "pixelated" }}
                >
                  <div className="text-sm font-black" style={{ imageRendering: "pixelated" }}>{level.name}</div>
                  <div className="text-xs font-normal opacity-70" style={{ imageRendering: "pixelated" }}>{level.timeLimit}s límite</div>
                </motion.button>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              onClick={onBack}
              className="text-white/40 text-xs mt-4 hover:text-white/70 transition-colors"
              style={{ fontFamily: "monospace", imageRendering: "pixelated" }}
            >
              Volver al menú principal
            </motion.button>
        </motion.div>
        )}
      </AnimatePresence>

      {/* End screen */}
      <AnimatePresence>
        {gameState.mode === "finished" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-40"
            style={{ imageRendering: "pixelated" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center mx-4"
              style={{ imageRendering: "pixelated" }}
            >
              <h3
                className="text-3xl font-black text-white mb-3"
                style={{ fontFamily: "monospace", imageRendering: "pixelated" }}
              >
                ¡Tiempo!
              </h3>
              <div className="text-2xl text-yellow-400 font-bold mb-1" style={{ fontFamily: "monospace", imageRendering: "pixelated" }}>
                {gameState.score} pts
              </div>
              <div className="text-white/60 text-sm mb-6" style={{ imageRendering: "pixelated" }}>{gameState.coinsCollected} monedas encontradas</div>

              <div className="flex flex-col gap-3" style={{ imageRendering: "pixelated" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => startGame(gameState.level)}
                  className="w-full bg-green-500 text-white font-bold py-3 rounded-lg"
                  style={{ fontFamily: "monospace", imageRendering: "pixelated" }}
                >
                  Jugar de Nuevo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setGameState((p) => ({ ...p, mode: "menu" }))}
                  className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg"
                  style={{ fontFamily: "monospace", imageRendering: "pixelated" }}
                >
                  Cambiar Nivel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={onBack}
                  className="w-full bg-red-500/20 text-red-300 font-bold py-2 rounded-lg border border-red-500/30"
                  style={{ fontFamily: "monospace", imageRendering: "pixelated" }}
                >
                  Menú Principal
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
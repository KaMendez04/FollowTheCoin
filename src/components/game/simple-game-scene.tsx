"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GAME_LEVELS, DECOY_OBJECTS, GAME_CONFIG_ENHANCED } from "@/constants/game-enhanced"
import { AvatarType } from "@/types"
import { GameLevel, GameObject } from "@/types/game-enhanced"
import { CHARACTERS, AVATAR_INFO } from "@/constants"
import PixelCharacter from "./pixel-character"

interface SimpleGameSceneProps {
  playerName: string
  selectedAvatar: AvatarType
  onBack: () => void
  difficulty?: "easy" | "medium" | "hard"
  isMultiplayer?: boolean
}

// ─── SVG pixel art components (idénticos al multiplayer) ───────────────────

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

function FakeCoinSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: "pixelated", opacity: 0.7 }}>
      <rect x="4" y="1" width="8" height="1" fill="#b45309" />
      <rect x="3" y="2" width="10" height="1" fill="#b45309" />
      <rect x="2" y="3" width="12" height="8" fill="#b45309" />
      <rect x="3" y="11" width="10" height="1" fill="#b45309" />
      <rect x="4" y="12" width="8" height="1" fill="#b45309" />
      <rect x="5" y="3" width="2" height="8" fill="#fcd34d" />
      <rect x="8" y="4" width="2" height="6" fill="#92400e" />
    </svg>
  )
}

// ─── Render de objeto decoy ────────────────────────────────────────────────

function renderDecoyContent(design: string, color: string, size: number) {
  if (design === "chest")     return <ChestSVG size={size} />
  if (design === "bomb")      return <BombSVG size={size} />
  if (design === "heart")     return <HeartSVG size={size} />
  if (design === "mushroom")  return <MushroomSVG size={size} />
  if (design === "ruby")      return <RubySVG size={size} />
  if (design === "lightning") return <LightningSVG size={size} />
  if (design === "key")       return <KeySVG size={size} />
  if (design === "potion")    return <PotionSVG size={size} />
  if (design === "fakecoin")  return <FakeCoinSVG size={size} />
  return <StarSVG size={size} color={color} />
}

function randInt(min: number, max: number, step = 8) {
  const range = Math.floor((max - min) / step) + 1
  return min + Math.floor(Math.random() * range) * step
}

// ─── Componente principal ──────────────────────────────────────────────────

export default function SimpleGameScene({
  playerName,
  selectedAvatar,
  onBack,
  difficulty,
  isMultiplayer = false,
}: SimpleGameSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [gameState, setGameState] = useState<{
    mode: "menu" | "playing" | "finished"
    level: GameLevel
    score: number
    timeLeft: number
    objects: GameObject[]
    coinPosition: { x: number; y: number }
    coinsCollected: number
  }>({
    mode: "menu",
    level: GAME_LEVELS[0],
    score: 0,
    timeLeft: GAME_LEVELS[0].timeLimit,
    objects: [],
    coinPosition: { x: 50, y: 50 },
    coinsCollected: 0,
  })

  const [coinVisible, setCoinVisible] = useState(true)
  const [mouse, setMouse] = useState({ x: 0, y: 0, active: false })

  // Partículas flotantes (igual que multiplayer)
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

  const generateCoinPosition = useCallback(
    () => ({ x: 12 + Math.random() * 74, y: 18 + Math.random() * 62 }),
    []
  )

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

  const startGame = useCallback(
    (level: GameLevel) => {
      const coinPos = generateCoinPosition()
      const generatedObjects: GameObject[] = []

      for (let i = 0; i < level.objectCount; i++) {
        const design = itemDesigns[Math.floor(Math.random() * itemDesigns.length)]
        const size = randInt(22, 52, 8)
        generatedObjects.push({
          id: `obj-${i}`,
          type: "decoy",
          x: 5 + Math.random() * 88,
          y: 12 + Math.random() * 78,
          color: itemColors[design] ?? "#facc15",
          design,
          _size: size,
          points: -1,
        })
      }

      setGameState({
        mode: "playing",
        level,
        score: 0,
        timeLeft: level.timeLimit,
        objects: generatedObjects,
        coinPosition: coinPos,
        coinsCollected: 0,
      })
      setCoinVisible(true)
    },
    [generateCoinPosition]
  )

  const endGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, mode: "finished" }))
  }, [])

  const goBackToMenu = useCallback(() => {
    setGameState({
      mode: "menu",
      level: GAME_LEVELS[0],
      score: 0,
      timeLeft: GAME_LEVELS[0].timeLimit,
      objects: [],
      coinPosition: { x: 50, y: 50 },
      coinsCollected: 0,
    })
  }, [])

  // Auto-start en modo multijugador
  useEffect(() => {
    if (isMultiplayer && difficulty && gameState.mode === "menu") {
      const level = GAME_LEVELS.find((l) => l.difficulty === difficulty) || GAME_LEVELS[0]
      startGame(level)
    }
  }, [isMultiplayer, difficulty, gameState.mode, startGame])

  // Timer
  useEffect(() => {
    if (gameState.mode !== "playing") return
    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          endGame()
          return prev
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameState.mode, endGame])

  // Clic en moneda
  const handleCoinClick = useCallback(() => {
    if (!coinVisible || gameState.mode !== "playing") return
    setCoinVisible(false)
    setGameState((prev) => ({
      ...prev,
      score: prev.score + 1,
      coinsCollected: prev.coinsCollected + 1,
    }))
    setTimeout(() => {
      setCoinVisible(true)
      setGameState((prev) => ({
        ...prev,
        coinPosition: generateCoinPosition(),
      }))
    }, 120)
  }, [coinVisible, gameState.mode, generateCoinPosition])

  // Clic en decoy
  const handleDecoyClick = useCallback(() => {
    if (gameState.mode !== "playing") return
    setGameState((prev) => ({ ...prev, score: Math.max(0, prev.score - 1) }))
  }, [gameState.mode])

  const coinSize =
    gameState.level.difficulty === "hard" ? 36 : gameState.level.difficulty === "medium" ? 44 : 50

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse((p) => ({ ...p, active: false }))}
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "#050505",
        imageRendering: "pixelated",
      }}
    >
      {/* Cruz pixel art de fondo */}
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

      {/* Partículas flotantes */}
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

      {/* Trail del cursor */}
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

      {/* HUD superior (modo playing) */}
      {gameState.mode === "playing" && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-black/75 backdrop-blur-sm rounded-xl px-5 py-2 border border-white/10 flex items-center gap-5">
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
      )}

      {/* Área de juego */}
      <div className="relative w-full h-[calc(100vh-6rem)] max-w-6xl mx-auto" style={{ zIndex: 5 }}>
        {/* Moneda */}
        <AnimatePresence>
          {coinVisible && gameState.mode === "playing" && (
            <motion.div
              key="coin"
              className="absolute cursor-pointer"
              style={{
                left: `${gameState.coinPosition.x}%`,
                top: `${gameState.coinPosition.y}%`,
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
              whileTap={{ scale: 0.85 }}
              onClick={handleCoinClick}
            >
              <CoinSVG size={coinSize} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Objetos decoy */}
        {gameState.mode === "playing" &&
          gameState.objects.map((obj) => {
            const size = (obj as any)._size ?? 36
            const design = String((obj as any).design ?? "star")
            const color = String(obj.color ?? "#facc15")
            return (
              <motion.div
                key={obj.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  transform: "translate(-50%,-50%)",
                  zIndex: 12,
                }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                whileTap={{ scale: 0.85 }}
                onClick={handleDecoyClick}
              >
                {renderDecoyContent(design, color, size)}
              </motion.div>
            )
          })}

        {/* ─── Menú principal ─────────────────────────────────────── */}
        <AnimatePresence>
          {gameState.mode === "menu" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center z-40"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4"
                style={{ imageRendering: "pixelated" }}
              >
                <h3
                  className="text-3xl font-black text-center text-white mb-6"
                  style={{ fontFamily: "monospace" }}
                >
                  Moneda Pixeleada
                </h3>

                <div className="mb-6">
                  <div className="text-center mb-4">
                    <div className="text-white/70 text-sm" style={{ fontFamily: "monospace" }}>
                      Selecciona dificultad
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {GAME_LEVELS.map((level, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startGame(level)}
                        className="relative w-full h-16 border-b-4 border-white/20 bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between text-white"
                        style={{ imageRendering: "pixelated" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <div className="text-lg font-black" style={{ fontFamily: "monospace" }}>
                              {level.name}
                            </div>
                            <div className="text-sm text-white/60">
                              {level.timeLimit}s límite
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl">
                          {level.difficulty === "easy" ? "🌟" : level.difficulty === "medium" ? "⚡" : "🔥"}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onBack}
                  className="w-full h-12 border-b-4 border-white/20 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white/70 font-semibold"
                >
                  Volver al menú principal
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Pantalla de fin ─────────────────────────────────────── */}
        <AnimatePresence>
          {gameState.mode === "finished" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-40"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4"
                style={{ imageRendering: "pixelated" }}
              >
                <h3
                  className="text-3xl font-black text-center text-white mb-3"
                  style={{ fontFamily: "monospace" }}
                >
                  ¡Tiempo!
                </h3>
                <div className="text-2xl text-yellow-400 font-bold mb-1" style={{ fontFamily: "monospace" }}>
                  {gameState.score} pts
                </div>
                <div className="text-white/60 text-sm mb-6">
                  {gameState.coinsCollected} monedas encontradas
                </div>

                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goBackToMenu}
                    className="w-full h-12 border-b-4 border-yellow-400 bg-yellow-300 text-black font-semibold rounded-lg"
                  >
                    Jugar de nuevo
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    className="w-full h-12 border-b-4 border-white/20 bg-white/10 text-white/70 font-semibold rounded-lg"
                  >
                    Menú Principal
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
"use client"

import { motion, AnimatePresence, TargetAndTransition } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import PixelCharacter from "./pixel-character"

const characters = [
  { id: 1, type: "hero", color: "#e74c3c", delay: 0.2 },
  { id: 2, type: "blob", color: "#ff69b4", delay: 0.4 },
  { id: 3, type: "creature", color: "#f1c40f", delay: 0.6 },
  { id: 4, type: "robot", color: "#3498db", delay: 0.8 },
  { id: 5, type: "ghost", color: "#9b59b6", delay: 1.0 },
]

const particleColors = ["#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#2ecc71", "#ffffff"]

const SCORES_KEY = "pixel_scene_top_scores"
const PLAYER_NAME_KEY = "pixel_scene_player_name"
const TARGET_SCORE = 25
const GAME_TIME = 20

type Burst = {
  id: number
  x: number
  y: number
}

type CoinPosition = {
  x: number
  y: number
}

type GameStatus = "idle" | "playing" | "won" | "lost"

type ScoreEntry = {
  id: string
  name: string
  score: number
  timeLeft: number
  won: boolean
  playedAt: number
}

function sortScores(scores: ScoreEntry[]) {
  return [...scores].sort((a, b) => {
    if (a.won !== b.won) return a.won ? -1 : 1
    if (a.score !== b.score) return b.score - a.score
    if (a.timeLeft !== b.timeLeft) return b.timeLeft - a.timeLeft
    return b.playedAt - a.playedAt
  })
}

export default function PixelScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  const [bursts, setBursts] = useState<Burst[]>([])
  const [mouse, setMouse] = useState({ x: 0, y: 0, active: false })
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  const [playerName, setPlayerName] = useState("")
  const [bestScores, setBestScores] = useState<ScoreEntry[]>([])

  const [gameStatus, setGameStatus] = useState<GameStatus>("idle")
  const [score, setScore] = useState(0)
  const [targetScore, setTargetScore] = useState(TARGET_SCORE)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [coinPosition, setCoinPosition] = useState<CoinPosition>({ x: 50, y: 56 })

  const sparklePositions = useMemo(
    () =>
      [...Array(12)].map((_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        top: 8 + Math.random() * 60,
        delay: 1 + Math.random() * 2.5,
        repeatDelay: Math.random() * 3,
      })),
    []
  )

  const floatingParticles = useMemo(
    () =>
      [...Array(24)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        duration: 4 + Math.random() * 4,
        delay: 1 + Math.random() * 4,
        size: Math.random() > 0.5 ? "w-1 h-1 md:w-2 md:h-2" : "w-1.5 h-1.5",
      })),
    []
  )

  const trailParticles = useMemo(
    () =>
      [...Array(8)].map((_, i) => ({
        id: i,
        size: i % 3 === 0 ? 8 : 6,
        color: particleColors[i % particleColors.length],
        offsetX: (i - 4) * 7,
        offsetY: (i % 2 === 0 ? -1 : 1) * (4 + i),
        duration: 0.22 + i * 0.03,
      })),
    []
  )

  useEffect(() => {
    const savedScores = localStorage.getItem(SCORES_KEY)
    const savedPlayerName = localStorage.getItem(PLAYER_NAME_KEY)

    if (savedScores) {
      try {
        setBestScores(sortScores(JSON.parse(savedScores)).slice(0, 3))
      } catch {
        setBestScores([])
      }
    }

    if (savedPlayerName) {
      setPlayerName(savedPlayerName)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(PLAYER_NAME_KEY, playerName)
  }, [playerName])

  useEffect(() => {
    if (gameStatus !== "playing") return
    if (timeLeft <= 0) return

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [timeLeft, gameStatus])

  useEffect(() => {
    if (gameStatus === "playing" && score >= targetScore) {
      finishGame(true)
    }
  }, [score, gameStatus, targetScore])

  useEffect(() => {
    if (gameStatus === "playing" && timeLeft <= 0 && score < targetScore) {
      finishGame(false)
    }
  }, [timeLeft, score, gameStatus, targetScore])

  function playRetroBeep(freq = 520, duration = 0.06, type: OscillatorType = "square") {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

      if (!AudioCtx) return

      const ctx = new AudioCtx()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.type = type
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime)

      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start()
      oscillator.stop(ctx.currentTime + duration + 0.02)

      window.setTimeout(() => {
        ctx.close().catch(() => {})
      }, 120)
    } catch {}
  }

  function playCoinSound() {
    playRetroBeep(880, 0.05)
    window.setTimeout(() => playRetroBeep(1180, 0.06), 50)
  }

  function playStartSound() {
    playRetroBeep(520, 0.06)
    window.setTimeout(() => playRetroBeep(660, 0.06), 60)
    window.setTimeout(() => playRetroBeep(820, 0.08), 120)
  }

  function randomCoinPosition() {
    return {
      x: 18 + Math.random() * 64,
      y: 30 + Math.random() * 34,
    }
  }

  function saveScore(entry: ScoreEntry) {
    const updated = sortScores([entry, ...bestScores]).slice(0, 3)
    setBestScores(updated)
    localStorage.setItem(SCORES_KEY, JSON.stringify(updated))
  }

  function finishGame(won: boolean) {
    setGameStatus(won ? "won" : "lost")

    const entry: ScoreEntry = {
      id: `${Date.now()}-${Math.random()}`,
      name: playerName.trim() || "Invitado",
      score,
      timeLeft,
      won,
      playedAt: Date.now(),
    }

    saveScore(entry)

    if (won) {
      setTargetScore((prev) => prev + 5)
      playRetroBeep(700, 0.08)
      window.setTimeout(() => playRetroBeep(900, 0.08), 80)
      window.setTimeout(() => playRetroBeep(1200, 0.12), 160)
    } else {
      playRetroBeep(340, 0.08)
      window.setTimeout(() => playRetroBeep(260, 0.1), 90)
    }
  }

  function startGame(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    setScore(0)
    setTimeLeft(GAME_TIME)
    setCoinPosition(randomCoinPosition())
    setGameStatus("playing")
    playStartSound()
  }

  function catchCoin(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    if (gameStatus !== "playing") return

    setScore((prev) => prev + 1)
    setCoinPosition(randomCoinPosition())
    playCoinSound()
  }

  function handleSceneClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now() + Math.random()

    setBursts((prev) => [...prev, { id, x, y }])
    playRetroBeep(460, 0.05)

    setClickCount((prev) => {
      const next = prev + 1
      if (next >= 7) {
        setShowEasterEgg(true)
        window.setTimeout(() => setShowEasterEgg(false), 1500)
        return 0
      }
      return next
    })

    window.setTimeout(() => {
      setBursts((prev) => prev.filter((burst) => burst.id !== id))
    }, 800)
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    })
  }

  return (
    <div
      ref={containerRef}
      onClick={handleSceneClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse((prev) => ({ ...prev, active: false }))}
      className="relative min-h-screen overflow-hidden bg-[#030326] px-4 py-6"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(44,56,120,0.18),transparent_55%)]" />
      <div className="absolute bottom-0 left-0 right-0 z-0 h-32 bg-gradient-to-t from-[#1a1a2e] to-transparent" />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {floatingParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute ${particle.size}`}
            style={{ left: `${particle.left}%`, backgroundColor: particle.color }}
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 1, 1, 0] }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        {sparklePositions.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute"
            style={{ left: `${sparkle.left}%`, top: `${sparkle.top}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: sparkle.delay,
              repeatDelay: sparkle.repeatDelay,
            }}
          >
            <Sparkle />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {mouse.active && (
          <div className="absolute inset-0 z-[1] pointer-events-none">
            {trailParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute"
                animate={{
                  x: mouse.x + particle.offsetX,
                  y: mouse.y + particle.offsetY,
                  opacity: [0.25, 0.9, 0.25],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: particle.duration, ease: "easeOut" }}
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-[1] pointer-events-none">
        {bursts.map((burst) => (
          <div key={burst.id}>
            <motion.div
              className="absolute rounded-full border border-white/35"
              style={{
                left: burst.x,
                top: burst.y,
                width: 12,
                height: 12,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0.4, opacity: 0.8 }}
              animate={{ scale: 8, opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i / 14) * Math.PI * 2
              const distance = 28 + (i % 3) * 10
              const size = i % 2 === 0 ? 6 : 8
              const color = particleColors[i % particleColors.length]

              return (
                <motion.div
                  key={`${burst.id}-${i}`}
                  className="absolute"
                  style={{
                    left: burst.x,
                    top: burst.y,
                    width: size,
                    height: size,
                    backgroundColor: color,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute left-1/2 top-6 z-20 -translate-x-1/2"
          >
            <div className="pixel-text text-xl text-yellow-300 md:text-3xl">1-UP!</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col items-center justify-center gap-6 lg:grid lg:grid-cols-[1fr_280px] lg:items-center lg:gap-8">
        <div className="flex w-full flex-col items-center">
          <ArcadeMessage />

          <div className="mb-4 flex w-full max-w-md flex-col items-center gap-3">
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Tu nombre"
                className="h-11 flex-1 border border-white/15 bg-white/10 px-4 text-center text-sm text-white outline-none placeholder:text-white/45"
              />

              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={startGame}
                className="h-11 min-w-[120px] border-b-4 border-[#ca8a04] bg-[#facc15] px-5 pixel-text text-sm text-[#1f2937] shadow-[0_6px_0_0_rgba(0,0,0,0.28)]"
              >
                START
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pixel-text text-[11px] text-white md:text-xs">
              <HudPill label={`META ${targetScore}`} />
              <HudPill label={`SCORE ${score}`} />
              <HudPill label={`TIME ${timeLeft}`} />
            </div>

            <AnimatePresence mode="wait">
              {gameStatus === "won" && (
                <motion.div
                  key="won"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="pixel-text text-sm text-green-300"
                >
                  ¡GANASTE!
                </motion.div>
              )}

              {gameStatus === "lost" && (
                <motion.div
                  key="lost"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="pixel-text text-sm text-red-300"
                >
                  GAME OVER
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex min-h-[300px] w-full items-end justify-center">
            <div className="relative z-10 flex flex-wrap items-end justify-center gap-4 px-4 md:gap-8 lg:gap-12">
              {characters.map((char) => (
                <CharacterHover key={char.id} type={char.type}>
                  <PixelCharacter type={char.type} color={char.color} delay={char.delay} />
                </CharacterHover>
              ))}
            </div>

            <AnimatePresence>
              {gameStatus === "playing" && (
                <motion.button
                  key={`${coinPosition.x}-${coinPosition.y}-${score}`}
                  onClick={catchCoin}
                  className="absolute z-[15]"
                  style={{
                    left: `${coinPosition.x}%`,
                    top: `${coinPosition.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    scale: { duration: 0.3 },
                    rotate: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <Coin />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-8 left-1/2 z-0 h-2 w-[90%] max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
        </div>

        <div className="w-full max-w-sm lg:max-w-none">
          <RankingCard scores={bestScores} />
        </div>
      </div>
    </div>
  )
}

function HudPill({ label }: { label: string }) {
  return (
    <div className="border border-white/15 bg-white/10 px-3 py-1">
      {label}
    </div>
  )
}

function RankingCard({ scores }: { scores: ScoreEntry[] }) {
  return (
    <div className="border border-white/15 bg-white/10 p-4 text-white backdrop-blur-[2px]">
      <div className="pixel-text mb-3 text-center text-sm md:text-base">TOP 3</div>

      {scores.length === 0 ? (
        <p className="text-center text-sm text-white/65">
          Todavía no hay partidas guardadas.
        </p>
      ) : (
        <div className="space-y-2">
          {scores.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between border border-white/10 bg-black/10 px-3 py-2 text-xs md:text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="pixel-text text-yellow-300">#{index + 1}</span>
                <span className="max-w-[90px] truncate">{entry.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span>{entry.score}</span>
                <span className="text-white/55">|</span>
                <span>{entry.timeLeft}s</span>
                <span className={entry.won ? "text-green-300" : "text-red-300"}>
                  {entry.won ? "WIN" : "LOSE"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CharacterHover({
  type,
  children,
}: {
  type: string
  children: React.ReactNode
}) {
  const animations: Record<
    string,
    {
      whileHover: TargetAndTransition
      transition: { [key: string]: number | string | boolean }
    }
  > = {
    hero: {
      whileHover: { y: -8, rotate: -4, scale: 1.05 },
      transition: { type: "spring", stiffness: 260, damping: 12 },
    },
    blob: {
      whileHover: { scaleX: 1.1, scaleY: 0.92, y: -4 },
      transition: { type: "spring", stiffness: 260, damping: 12 },
    },
    creature: {
      whileHover: { rotate: [0, -6, 6, -4, 0], y: -4, scale: 1.05 },
      transition: { duration: 0.5 },
    },
    robot: {
      whileHover: { y: -6, rotate: 3, scale: 1.05 },
      transition: { type: "spring", stiffness: 220, damping: 10 },
    },
    ghost: {
      whileHover: { y: [-2, -10, -4], x: [0, 4, -2, 0], scale: 1.05 },
      transition: { duration: 0.8, repeat: Infinity },
    },
  }

  const config = animations[type] ?? {
    whileHover: { scale: 1.05 },
    transition: { duration: 0.25 },
  }

  return (
    <motion.div whileHover={config.whileHover} transition={config.transition}>
      {children}
    </motion.div>
  )
}

function ArcadeMessage() {
  const rows = ["HELLO", "WORLD"]

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.45 }}
      className="mb-5 flex select-none flex-col items-center gap-0"
    >
      {rows.map((row, rowIndex) => (
        <div key={row} className="flex items-center justify-center gap-0">
          {row.split("").map((letter, index) => (
            <PixelLetter
              key={`${row}-${index}`}
              letter={letter}
              delay={0.9 + rowIndex * 0.12 + index * 0.04}
            />
          ))}
        </div>
      ))}
    </motion.div>
  )
}

function PixelLetter({ letter, delay }: { letter: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.75, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="pixel-text text-[28px] font-black leading-none text-white md:text-[48px]"
      style={{ textShadow: "3px 3px 0 #2b2f36" }}
    >
      {letter}
    </motion.span>
  )
}

function Coin() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 16 16"
      className="h-9 w-9 md:h-11 md:w-11"
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="4" y="1" width="8" height="1" fill="#facc15" />
      <rect x="3" y="2" width="10" height="1" fill="#facc15" />
      <rect x="2" y="3" width="12" height="1" fill="#facc15" />
      <rect x="2" y="4" width="12" height="1" fill="#facc15" />
      <rect x="1" y="5" width="14" height="1" fill="#facc15" />
      <rect x="1" y="6" width="14" height="1" fill="#facc15" />
      <rect x="1" y="7" width="14" height="1" fill="#facc15" />
      <rect x="1" y="8" width="14" height="1" fill="#facc15" />
      <rect x="1" y="9" width="14" height="1" fill="#facc15" />
      <rect x="2" y="10" width="12" height="1" fill="#facc15" />
      <rect x="2" y="11" width="12" height="1" fill="#facc15" />
      <rect x="3" y="12" width="10" height="1" fill="#facc15" />
      <rect x="4" y="13" width="8" height="1" fill="#facc15" />
      <rect x="5" y="3" width="1" height="9" fill="#fde68a" />
      <rect x="6" y="2" width="2" height="11" fill="#fde68a" />
      <rect x="8" y="4" width="1" height="6" fill="#ca8a04" />
      <rect x="9" y="3" width="1" height="8" fill="#ca8a04" />
    </svg>
  )
}

function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="md:w-6 md:h-6">
      <rect x="7" y="0" width="2" height="4" fill="#fff" />
      <rect x="7" y="12" width="2" height="4" fill="#fff" />
      <rect x="0" y="7" width="4" height="2" fill="#fff" />
      <rect x="12" y="7" width="4" height="2" fill="#fff" />
      <rect x="7" y="7" width="2" height="2" fill="#fff" />
    </svg>
  )
}
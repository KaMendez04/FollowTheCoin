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

type Burst = {
  id: number
  x: number
  y: number
}

type CoinPosition = {
  x: number
  y: number
}

export default function PixelScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  const [bursts, setBursts] = useState<Burst[]>([])
  const [mouse, setMouse] = useState({ x: 0, y: 0, active: false })
  const [clickCount, setClickCount] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)

  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [coinPosition, setCoinPosition] = useState<CoinPosition>({ x: 50, y: 60 })

  const sparklePositions = useMemo(
    () =>
      [...Array(15)].map((_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 60,
        delay: 1.5 + Math.random() * 3,
        repeatDelay: Math.random() * 4,
      })),
    []
  )

  const floatingParticles = useMemo(
    () =>
      [...Array(30)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        duration: 4 + Math.random() * 4,
        delay: 2 + Math.random() * 5,
        size: Math.random() > 0.5 ? "w-1 h-1 md:w-2 md:h-2" : "w-1.5 h-1.5 md:w-2.5 md:h-2.5",
      })),
    []
  )

  useEffect(() => {
    if (!gameStarted) return
    if (timeLeft <= 0) {
      setGameStarted(false)
      return
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [gameStarted, timeLeft])

  function playRetroBeep(freq = 520, duration = 0.06, type: OscillatorType = "square") {
    try {
      const AudioCtx =
        window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

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
    playRetroBeep(880, 0.05, "square")
    window.setTimeout(() => playRetroBeep(1180, 0.06, "square"), 50)
  }

  function playStartSound() {
    playRetroBeep(520, 0.06, "square")
    window.setTimeout(() => playRetroBeep(660, 0.06, "square"), 60)
    window.setTimeout(() => playRetroBeep(820, 0.08, "square"), 120)
  }

  function randomCoinPosition() {
    return {
      x: 15 + Math.random() * 70,
      y: 26 + Math.random() * 42,
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now() + Math.random()

    setBursts((prev) => [...prev, { id, x, y }])
    setClickCount((prev) => {
      const next = prev + 1
      if (next >= 7) {
        setShowEasterEgg(true)
        playRetroBeep(300, 0.08)
        window.setTimeout(() => playRetroBeep(500, 0.08), 80)
        window.setTimeout(() => playRetroBeep(800, 0.1), 160)
        window.setTimeout(() => setShowEasterEgg(false), 1800)
        return 0
      }
      return next
    })

    playRetroBeep(460, 0.05)

    window.setTimeout(() => {
      setBursts((prev) => prev.filter((burst) => burst.id !== id))
    }, 900)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    })
  }

  const handleMouseLeave = () => {
    setMouse((prev) => ({ ...prev, active: false }))
  }

  const handleStartGame = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setGameStarted(true)
    setScore(0)
    setTimeLeft(15)
    setCoinPosition(randomCoinPosition())
    playStartSound()
  }

  const handleCoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (!gameStarted) return

    setScore((prev) => prev + 1)
    setCoinPosition(randomCoinPosition())
    playCoinSound()
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#030326]"
    >
      {/* Soft center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(44,56,120,0.18),transparent_55%)] z-0" />

      {/* Pixel grid floor */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1a2e] to-transparent z-0" />

      {/* Floating background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {floatingParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute ${particle.size}`}
            style={{
              left: `${particle.left}%`,
              backgroundColor: particle.color,
            }}
            initial={{ y: "100vh", opacity: 0 }}
            animate={{
              y: "-10vh",
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Sparkles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {sparklePositions.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
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

      {/* Click burst particles */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {bursts.map((burst) => (
          <div key={burst.id}>
            <motion.div
              className="absolute rounded-full border border-white/40"
              style={{
                left: burst.x,
                top: burst.y,
                width: 12,
                height: 12,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0.3, opacity: 0.8 }}
              animate={{ scale: 10, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />

            <motion.div
              className="absolute bg-white"
              style={{
                left: burst.x,
                top: burst.y,
                width: 8,
                height: 8,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0.4, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />

            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (i / 18) * Math.PI * 2
              const distance = 35 + (i % 4) * 10
              const size = i % 3 === 0 ? 8 : 6
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
                    imageRendering: "pixelated",
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0,
                    scale: 0.8,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Easter egg */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-10 z-20"
          >
            <div className="pixel-text text-[22px] md:text-[38px] text-yellow-300 drop-shadow-[4px_4px_0_rgba(0,0,0,0.45)]">
              1-UP!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message */}
      <ArcadeMessage />

      {/* Start button */}
      <motion.button
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleStartGame}
        className="relative z-10 mb-6 md:mb-8 px-5 py-2 md:px-6 md:py-3 bg-[#facc15] text-[#1f2937] pixel-text text-sm md:text-lg border-b-4 border-[#ca8a04] shadow-[0_6px_0_0_rgba(0,0,0,0.3)]"
      >
        START
      </motion.button>

      {/* Mini game HUD */}
      <div className="relative z-10 mb-4 flex items-center gap-3 md:gap-5 pixel-text text-white text-xs md:text-sm">
        <div className="bg-white/10 px-3 py-1 border border-white/15">SCORE: {score}</div>
        <div className="bg-white/10 px-3 py-1 border border-white/15">TIME: {timeLeft}</div>
        {!gameStarted && timeLeft === 0 && (
          <div className="bg-yellow-300/20 px-3 py-1 border border-yellow-300/20 text-yellow-300">
            GAME OVER
          </div>
        )}
      </div>

      {/* Characters */}
      <div className="relative z-10 flex flex-wrap items-end justify-center gap-4 px-4 md:gap-8 lg:gap-12">
        {characters.map((char) => (
          <CharacterHover key={char.id} type={char.type}>
            <PixelCharacter type={char.type} color={char.color} delay={char.delay} />
          </CharacterHover>
        ))}
      </div>

      {/* Mini game coin */}
      <AnimatePresence>
        {gameStarted && (
          <motion.button
            key={`${coinPosition.x}-${coinPosition.y}-${score}`}
            onClick={handleCoinClick}
            className="absolute z-[15]"
            style={{
              left: `${coinPosition.x}%`,
              top: `${coinPosition.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: [1, 1.08, 1], rotate: [0, 6, -6, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: { duration: 0.35 },
              rotate: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Coin />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Ground line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-20 left-1/2 z-10 h-2 w-[90%] max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent md:bottom-24"
      />
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
      transition: Record<string, unknown>
    }
  > = {
    hero: {
      whileHover: { y: -8, rotate: -4, scale: 1.06 },
      transition: { type: "spring", stiffness: 260, damping: 12 },
    },
    blob: {
      whileHover: { scaleX: 1.12, scaleY: 0.9, y: -4 },
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
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.5 }}
      className="relative z-10 mb-6 md:mb-8 flex select-none flex-col items-center gap-1 md:gap-2"
    >
      {rows.map((row, rowIndex) => (
        <div key={row} className="flex items-center justify-center gap-0">
          {row.split("").map((letter, index) => (
            <PixelLetter
              key={`${row}-${index}`}
              letter={letter}
              delay={1.2 + rowIndex * 0.15 + index * 0.05}
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
      initial={{ opacity: 0, scale: 0.7, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.22 }}
      className="pixel-text text-2xl font-black leading-none text-white md:text-4xl"
      style={{
        textShadow: "3px 3px 0 #2b2f36",
      }}
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
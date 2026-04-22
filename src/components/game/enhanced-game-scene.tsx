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

// ─── Size helpers ─────────────────────────────────────────────────────────────
function randSize(min: number, max: number, step = 8) {
  const steps = Math.floor((max - min) / step)
  return min + Math.floor(Math.random() * (steps + 1)) * step
}

// ─── Decoy animations ─────────────────────────────────────────────────────────
function getDecoyAnimation(design: string) {
  switch (design) {
    case "star":
      return { animate: { rotate: [0, 360], scale: [1, 1.15, 1] }, transition: { rotate: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "linear" as const }, scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const } } }
    case "chest":
      return { animate: { y: [0, -4, 0], rotateZ: [-2, 2, -2] }, transition: { duration: 2 + Math.random() * 1.5, repeat: Infinity, ease: "easeInOut" as const } }
    case "bomb":
      return { animate: { scale: [1, 1.08, 1], x: [-1, 1, -1] }, transition: { duration: 0.4 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut" as const } }
    case "heart":
      return { animate: { scale: [1, 1.2, 1] }, transition: { duration: 0.8 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" as const } }
    case "mushroom":
      return { animate: { y: [0, -6, 0], rotateZ: [-3, 3, -3] }, transition: { duration: 1.8 + Math.random(), repeat: Infinity, ease: "easeInOut" as const } }
    case "ruby":
      return { animate: { rotateY: [0, 180, 360], scale: [1, 1.1, 1] }, transition: { duration: 2.5 + Math.random(), repeat: Infinity, ease: "easeInOut" as const } }
    case "lightning":
      return { animate: { opacity: [1, 0.4, 1], scale: [1, 1.12, 1], y: [0, -3, 0] }, transition: { duration: 0.6 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" as const } }
    case "key":
      return { animate: { rotate: [-8, 8, -8], y: [0, -3, 0] }, transition: { duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut" as const } }
    case "potion":
      return { animate: { scale: [1, 1.08, 1], rotateZ: [-4, 4, -4] }, transition: { duration: 2.2 + Math.random(), repeat: Infinity, ease: "easeInOut" as const } }
    case "fakecoin":
      return { animate: { rotateY: [0, 180, 360] }, transition: { duration: 1.8 + Math.random(), repeat: Infinity, ease: "linear" as const } }
    default:
      return { animate: { y: [0, -4, 0] }, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const } }
  }
}

function getCharacterAnimation(type: string) {
  switch (type) {
    case "Mario":
    case "Luigi":
      return { animate: { x: [-3, 3, -3], y: [0, -4, 0] }, transition: { duration: 0.9 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" as const } }
    case "Kirby":
      return { animate: { scaleX: [1, 1.1, 1], scaleY: [1, 0.92, 1], y: [0, -5, 0] }, transition: { duration: 1.2 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" as const } }
    case "Pikachu":
      return { animate: { rotate: [-5, 5, -5], y: [0, -4, 0] }, transition: { duration: 0.7 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut" as const } }
    case "Robot":
      return { animate: { y: [0, -3, 0], rotateZ: [-2, 2, -2] }, transition: { duration: 1.5 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" as const } }
    default:
      return { animate: { y: [0, -5, 0] }, transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" as const } }
  }
}

// ─── SVG Components ────────────────────────────────────────────────────────────
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

function DecoyGraphic({ design, color, size }: { design: string; color: string; size: number }) {
  const v = useMemo(() => Math.floor(Math.random() * 3), [])
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
    case "fakecoin": return <FakeCoinSVG size={size} variant={v} />
    default: return <StarSVG size={size} color={color} />
  }
}

// ─── Level Backgrounds ────────────────────────────────────────────────────────
function LevelBackground({ difficulty }: { difficulty: "easy" | "medium" | "hard" }) {
  if (difficulty === "easy") {
    // Campo Abierto - subtle green tones in background
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Distant hills */}
        <svg className="absolute bottom-0 w-full opacity-10" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,200 C200,80 400,120 720,60 C1040,0 1200,100 1440,80 L1440,200 Z" fill="#22c55e"/>
        </svg>
        {/* Small grass tufts pixel style */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute" style={{ left: `${8 + i * 8}%`, bottom: `${5 + (i % 3) * 4}%`, opacity: 0.15 }}>
            <svg width="12" height="8" viewBox="0 0 12 8" style={{ imageRendering: "pixelated" }}>
              <rect x="5" y="0" width="2" height="8" fill="#4ade80"/>
              <rect x="2" y="2" width="2" height="6" fill="#4ade80"/>
              <rect x="8" y="2" width="2" height="6" fill="#4ade80"/>
            </svg>
          </div>
        ))}
        {/* Stars/sparkles */}
        {[...Array(20)].map((_, i) => (
          <div key={`star-${i}`} className="absolute" style={{ left: `${5 + (i * 4.7) % 92}%`, top: `${3 + (i * 5.3) % 45}%`, opacity: 0.12 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" style={{ imageRendering: "pixelated" }}>
              <rect x="3" y="0" width="2" height="8" fill="#fff"/>
              <rect x="0" y="3" width="8" height="2" fill="#fff"/>
            </svg>
          </div>
        ))}
      </div>
    )
  }

  if (difficulty === "medium") {
    // Bosque Denso - dark green trees
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Tree silhouettes */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute" style={{ left: `${i * 10.5}%`, bottom: `${3 + (i % 4) * 2}%`, opacity: 0.12 }}>
            <svg width="40" height="60" viewBox="0 0 20 30" style={{ imageRendering: "pixelated" }}>
              <rect x="8" y="20" width="4" height="10" fill="#5c3d11"/>
              <rect x="4" y="12" width="12" height="10" fill="#166534"/>
              <rect x="6" y="6" width="8" height="8" fill="#15803d"/>
              <rect x="7" y="1" width="6" height="7" fill="#16a34a"/>
            </svg>
          </div>
        ))}
        {/* Fog dots */}
        {[...Array(16)].map((_, i) => (
          <div key={`fog-${i}`} className="absolute rounded-full" style={{ left: `${(i * 6.3) % 95}%`, top: `${30 + (i * 5.7) % 60}%`, width: 40 + (i % 3) * 20, height: 8, opacity: 0.06, background: "#86efac", borderRadius: 999 }}/>
        ))}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,20,0,0.3) 100%)" }}/>
      </div>
    )
  }

  // Laberinto - pixel wall pattern
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Maze wall hints */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute" style={{
          left: `${(i % 4) * 26}%`,
          top: `${Math.floor(i / 4) * 45 + 10}%`,
          opacity: 0.07
        }}>
          <svg width="60" height="60" viewBox="0 0 30 30" style={{ imageRendering: "pixelated" }}>
            <rect x="0" y="0" width="30" height="4" fill="#94a3b8"/>
            <rect x="0" y="0" width="4" height="30" fill="#94a3b8"/>
            <rect x="0" y="26" width="20" height="4" fill="#94a3b8"/>
            <rect x="10" y="10" width="20" height="4" fill="#94a3b8"/>
            <rect x="10" y="10" width="4" height="20" fill="#94a3b8"/>
          </svg>
        </div>
      ))}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(15,0,30,0.4) 100%)" }}/>
    </div>
  )
}

// ─── Sound Engine ─────────────────────────────────────────────────────────────
function useGameSounds() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      ctxRef.current = new AudioCtx()
    }
    return ctxRef.current
  }, [])

  const beep = useCallback((freq: number, duration: number, type: OscillatorType = "square", vol = 0.06) => {
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration + 0.02)
    } catch {}
  }, [getCtx])

  const playCoin = useCallback(() => {
    beep(880, 0.05, "square", 0.07)
    setTimeout(() => beep(1180, 0.06, "square", 0.07), 50)
    setTimeout(() => beep(1480, 0.08, "triangle", 0.05), 100)
  }, [beep])

  const playMiss = useCallback(() => {
    beep(220, 0.08, "sawtooth", 0.05)
    setTimeout(() => beep(180, 0.1, "sawtooth", 0.04), 70)
  }, [beep])

  const playStart = useCallback(() => {
    beep(440, 0.06, "square", 0.06)
    setTimeout(() => beep(554, 0.06, "square", 0.06), 80)
    setTimeout(() => beep(659, 0.06, "square", 0.06), 160)
    setTimeout(() => beep(880, 0.1, "square", 0.07), 240)
  }, [beep])

  const playEnd = useCallback(() => {
    beep(659, 0.08, "square", 0.06)
    setTimeout(() => beep(554, 0.08, "square", 0.06), 90)
    setTimeout(() => beep(440, 0.08, "square", 0.06), 180)
    setTimeout(() => beep(330, 0.15, "square", 0.07), 270)
  }, [beep])

  const playEasterEgg = useCallback(() => {
    // Fun ascending arpeggio
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      setTimeout(() => beep(f, 0.1, "square", 0.06), i * 70)
    })
  }, [beep])

  const playLevelUp = useCallback(() => {
    beep(523, 0.07, "square", 0.06)
    setTimeout(() => beep(784, 0.07, "square", 0.06), 80)
    setTimeout(() => beep(1047, 0.12, "square", 0.07), 160)
  }, [beep])

  return { playCoin, playMiss, playStart, playEnd, playEasterEgg, playLevelUp }
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function EnhancedGameScene({ playerName, selectedAvatar, onBack }: EnhancedGameSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sounds = useGameSounds()

  // Easter egg: 7 fast taps
  const easterClickTimes = useRef<number[]>([])
  const [showEasterEgg, setShowEasterEgg] = useState(false)

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
  const [bursts, setBursts] = useState<{id: number; x: number; y: number}[]>([])

  const floatingParticles = useMemo(
    () => [...Array(28)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      color: ["#e74c3c","#f1c40f","#3498db","#9b59b6","#2ecc71","#ffffff","#ff69b4"][Math.floor(Math.random() * 7)],
      duration: 4 + Math.random() * 4,
      delay: 1 + Math.random() * 4,
      size: 2 + Math.random() * 3,
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

      objects.push({
        id: "player",
        type: "character",
        x: 10 + Math.random() * 15,
        y: 15 + Math.random() * 60,
        character: selectedAvatar,
        color: AVATAR_INFO[selectedAvatar].color,
      })

      objects.push({ id: "coin", type: "coin", x: coinPos.x, y: coinPos.y, collected: false })

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

      const itemDesigns = ["star","chest","bomb","heart","mushroom","ruby","lightning","key","potion","fakecoin"]
      const itemColors: Record<string, string> = {
        star: ["#facc15","#e74c3c","#3498db","#9b59b6","#2ecc71"][Math.floor(Math.random()*5)],
        chest: "#a05a2c", bomb: "#111", heart: "#e74c3c", mushroom: "#cc0000",
        ruby: "#cc0044", lightning: "#facc15", key: "#fbbf24", potion: "#7c3aed", fakecoin: "#facc15",
      }
      const remaining = level.objectCount - objects.length
      for (let i = 0; i < remaining; i++) {
        const design = itemDesigns[Math.floor(Math.random() * itemDesigns.length)]
        const size = randSize(
          design === "star" ? 24 : design === "chest" ? 36 : 22,
          design === "star" ? 56 : design === "chest" ? 60 : 52, 8
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
      sounds.playStart()
    },
    [selectedAvatar, playerName, generateGameObjects, generateCoinPosition, sounds]
  )

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

  useEffect(() => {
    if (gameState.mode === "finished") {
      sounds.playEnd()
    }
  }, [gameState.mode])

  const handleCoinClick = useCallback(() => {
    if (gameState.mode !== "playing") return
    setCoinVisible(false)
    const newPos = generateCoinPosition()
    setGameState((prev) => ({
      ...prev,
      score: prev.score + 1,
      coinsCollected: prev.coinsCollected + 1,
      objects: prev.objects.map((o) => (o.id === "coin" ? { ...o, x: newPos.x, y: newPos.y } : o)),
    }))
    sounds.playCoin()
    setTimeout(() => setCoinVisible(true), 120)
  }, [gameState.mode, generateCoinPosition, sounds])

  const handleDecoyClick = useCallback((e: React.MouseEvent) => {
    if (gameState.mode !== "playing") return
    setGameState((prev) => ({ ...prev, score: Math.max(0, prev.score - 1) }))
    sounds.playMiss()
    // Burst effect
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const id = Date.now() + Math.random()
      setBursts(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
      setTimeout(() => setBursts(prev => prev.filter(b => b.id !== id)), 600)
    }
  }, [gameState.mode, sounds])

  // Easter egg: 7 fast taps (max 400ms between each)
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    const now = Date.now()
    const times = easterClickTimes.current
    // Filter only clicks within the last 400ms
    const recent = times.filter(t => now - t < 400)
    recent.push(now)
    easterClickTimes.current = recent
    if (recent.length >= 7) {
      easterClickTimes.current = []
      setShowEasterEgg(true)
      sounds.playEasterEgg()
      setTimeout(() => setShowEasterEgg(false), 2000)
    }
  }, [sounds])

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
            filter: isPlayer ? `drop-shadow(0 0 6px ${object.color})` : undefined,
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

  const difficulty = gameState.level.difficulty

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse((p) => ({ ...p, active: false }))}
      onClick={handleContainerClick}
      className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-6"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Pixel grid */}
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none" style={{
        backgroundImage: "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
        backgroundSize: "4px 4px"
      }}/>
      {/* Scanlines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)"
      }}/>
      {/* Vignette */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)] pointer-events-none"/>

      {/* Themed level background */}
      {gameState.mode === "playing" && <LevelBackground difficulty={difficulty} />}

      {/* Ambient pixel crosses */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(18)].map((_, i) => (
          <div key={i} className="absolute opacity-10" style={{ left: `${5 + (i * 5.3) % 92}%`, top: `${4 + (i * 7.1) % 88}%` }}>
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
            animate={{ y: [0, -20, 0], opacity: [0.15, 0.65, 0.15] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Miss burst */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 8 }}>
        {bursts.map((b) => (
          <motion.div key={b.id} className="absolute" style={{ left: b.x, top: b.y, width: 0, height: 0 }}>
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-red-500"
                  style={{ marginLeft: -4, marginTop: -4 }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos(angle) * 30, y: Math.sin(angle) * 30, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )
            })}
          </motion.div>
        ))}
      </div>

      {/* Easter egg */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -20 }}
            className="absolute left-1/2 top-16 z-50 -translate-x-1/2 pointer-events-none"
          >
            <div className="border-2 border-yellow-400 bg-black/90 px-6 py-3 text-center">
              <div className="text-yellow-300 font-black text-2xl" style={{ fontFamily: "monospace" }}>★ 1-UP! ★</div>
              <div className="text-white/70 text-xs mt-1" style={{ fontFamily: "monospace" }}>BONUS ENCONTRADO</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      {gameState.mode === "playing" && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-30">
          <div className="border border-white/20 bg-black/80 backdrop-blur-sm px-5 py-2 flex items-center gap-5"
            style={{ imageRendering: "pixelated" }}>
            <div className="text-center">
              <div className="text-yellow-400 font-black text-base" style={{ fontFamily: "monospace" }}>{gameState.coinsCollected}</div>
              <div className="text-white/40 text-[10px]" style={{ fontFamily: "monospace" }}>MONEDAS</div>
            </div>
            <div className="w-px h-6 bg-white/15"/>
            <div className="text-center">
              <div className="text-white font-black text-base" style={{ fontFamily: "monospace" }}>{gameState.score}</div>
              <div className="text-white/40 text-[10px]" style={{ fontFamily: "monospace" }}>PUNTOS</div>
            </div>
            <div className="w-px h-6 bg-white/15"/>
            <div className="text-center">
              <div className={`font-black text-xl ${gameState.timeLeft <= 10 ? "text-red-400" : "text-white"}`} style={{ fontFamily: "monospace" }}>
                {gameState.timeLeft}s
              </div>
              <div className="text-white/40 text-[10px]" style={{ fontFamily: "monospace" }}>TIEMPO</div>
            </div>
            <div className="w-px h-6 bg-white/15"/>
            <div className="text-center">
              <div className="text-white/80 font-black text-xs" style={{ fontFamily: "monospace" }}>{gameState.level.name.split(" - ")[0].toUpperCase()}</div>
              <div className="text-white/40 text-[8px]" style={{ fontFamily: "monospace" }}>{gameState.level.name.split(" - ")[1]?.toUpperCase()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Game area */}
      <div className="relative w-full h-[calc(100vh-6rem)] max-w-6xl mx-auto" style={{ zIndex: 5 }}>
        {gameState.objects.map((obj) => (
          <div key={obj.id}>{renderObject(obj)}</div>
        ))}
      </div>

      {/* ── MENU ── */}
      <AnimatePresence>
        {gameState.mode === "menu" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-40"
            style={{ background: "rgba(5,5,5,0.92)", imageRendering: "pixelated" }}
          >
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2" style={{ fontFamily: "monospace", textShadow: "4px 4px 0 #ca8a04, 2px 2px 0 #78350f" }}>
                FOLLOW COIN
              </h1>
              <p className="text-white/60 text-sm" style={{ fontFamily: "monospace" }}>Toca la moneda dorada · cuidado con los imitadores</p>
              <p className="text-white/30 text-xs mt-1" style={{ fontFamily: "monospace" }}>Clic en objeto incorrecto = -1 punto</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {GAME_LEVELS.map((level, i) => {
                const colors = {
                  easy: { bg: "#16a34a", border: "#15803d", text: "#dcfce7", icon: "🌿" },
                  medium: { bg: "#b45309", border: "#92400e", text: "#fef3c7", icon: "🌲" },
                  hard: { bg: "#7c3aed", border: "#5b21b6", text: "#ede9fe", icon: "🔮" },
                }
                const c = colors[level.difficulty]
                return (
                  <motion.button
                    key={level.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startGame(level)}
                    className="border-b-4 px-6 py-4 font-black min-w-[170px] text-left"
                    style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text, fontFamily: "monospace" }}
                  >
                    <div className="text-lg mb-1">{c.icon}</div>
                    <div className="text-sm font-black">{level.name.split(" - ")[0]}</div>
                    <div className="text-xs opacity-80 font-normal">{level.name.split(" - ")[1]}</div>
                    <div className="text-xs opacity-60 mt-1">{level.timeLimit}s · {level.objectCount} objetos</div>
                  </motion.button>
                )
              })}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              onClick={onBack}
              className="text-white/40 text-xs hover:text-white/70 transition-colors border border-white/10 px-4 py-2"
              style={{ fontFamily: "monospace" }}
            >
              ← VOLVER AL MENÚ PRINCIPAL
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── END SCREEN ── */}
      <AnimatePresence>
        {gameState.mode === "finished" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-40"
            style={{ background: "rgba(5,5,5,0.88)", backdropFilter: "blur(2px)", imageRendering: "pixelated" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="border border-white/15 bg-black/60 p-8 max-w-sm w-full text-center mx-4"
            >
              <div className="text-yellow-400 text-4xl mb-2">⏱</div>
              <h3 className="text-3xl font-black text-white mb-3" style={{ fontFamily: "monospace", textShadow: "3px 3px 0 #78350f" }}>
                ¡TIEMPO!
              </h3>
              <div className="text-3xl text-yellow-400 font-black mb-1" style={{ fontFamily: "monospace" }}>
                {gameState.score} PTS
              </div>
              <div className="text-white/50 text-sm mb-6" style={{ fontFamily: "monospace" }}>{gameState.coinsCollected} monedas encontradas</div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => startGame(gameState.level)}
                  className="w-full border-b-4 border-[#15803d] bg-[#16a34a] text-white font-black py-3"
                  style={{ fontFamily: "monospace" }}
                >
                  ▶ JUGAR DE NUEVO
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setGameState((p) => ({ ...p, mode: "menu" }))}
                  className="w-full border-b-4 border-[#1d4ed8] bg-[#2563eb] text-white font-black py-3"
                  style={{ fontFamily: "monospace" }}
                >
                  ◀ CAMBIAR NIVEL
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={onBack}
                  className="w-full border border-white/15 text-white/50 font-black py-2 hover:text-white/80 transition-colors"
                  style={{ fontFamily: "monospace" }}
                >
                  MENÚ PRINCIPAL
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
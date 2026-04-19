"use client"

import { motion } from "framer-motion"
import { useMemo, useRef, useState } from "react"

type Particle = {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
}

const COLORS = [
  "#ffffff",
  "#60a5fa",
  "#f87171",
  "#facc15",
  "#4ade80",
  "#a855f7",
  "#22d3ee",
  "#f472b6",
]

export default function InteractivePixelBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [burstKey, setBurstKey] = useState(0)
  const [clickPoint, setClickPoint] = useState({ x: 50, y: 50 })

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 45 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() > 0.75 ? 8 : 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 2,
    }))
  }, [])

  const sparkles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() > 0.5 ? 12 : 10,
      delay: Math.random() * 3,
    }))
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setClickPoint({ x, y })
    setBurstKey((prev) => prev + 1)
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="absolute inset-0 overflow-hidden bg-[#030326]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(18,18,60,0.35),transparent_60%)]" />

      {particles.map((particle) => {
        const dx = particle.x - clickPoint.x
        const dy = particle.y - clickPoint.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        const force = Math.max(18, 42 - distance * 0.45)

        const moveX = (dx / distance) * force
        const moveY = (dy / distance) * force

        return (
          <motion.div
            key={`${particle.id}-${burstKey}`}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              imageRendering: "pixelated",
              boxShadow: `0 0 0 1px ${particle.color}22`,
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 0.9 }}
            animate={{
              x: [0, 0, moveX, moveX * 0.45, 0],
              y: [0, -2, moveY, moveY * 0.45, 0],
              scale: [1, 1.15, 1, 1],
              opacity: [0.75, 1, 1, 0.85, 0.75],
            }}
            transition={{
              duration: 1.1,
              ease: "easeOut",
            }}
          />
        )
      })}

      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
          }}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.9, 1.15, 0.9] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        >
          <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white/80" />
          <div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-white/80" />
        </motion.div>
      ))}

      <motion.div
        key={`wave-${burstKey}`}
        className="pointer-events-none absolute rounded-full border border-white/30"
        style={{
          left: `${clickPoint.x}%`,
          top: `${clickPoint.y}%`,
          width: 12,
          height: 12,
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={{ scale: 0.4, opacity: 0.7 }}
        animate={{ scale: 10, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  )
}
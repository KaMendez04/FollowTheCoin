"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AVATAR_INFO } from "@/constants"
import { Copy, Check } from "lucide-react"
import { RoomPlayer, RoomState } from "@/lib/supabase/room"

interface RoomLobbyProps {
  roomCode: string
  players: RoomPlayer[]
  state: RoomState | null
  isHost: boolean
  onStartGame: (difficulty: "easy" | "medium" | "hard") => void
  onLeaveRoom: () => void
  loading: boolean
  error: string
}

const IMGS: Record<string, string> = {
  Mage: "/mage.png", Pikachu: "/pikachu.png", Finn: "/fin.png", AmongUs: "/amongus.png", Robot: "/robot.png"
}

function AvatarBox({ avatar }: { avatar: string | null }) {
  if (!avatar) return <div className="w-8 h-8 border border-white/20 bg-white/5"/>
  return (
    <div className="w-8 h-8 border border-white/20 overflow-hidden">
      {IMGS[avatar] ? (
        <img src={IMGS[avatar]} alt={avatar} className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }}/>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-black"
          style={{ backgroundColor: AVATAR_INFO[avatar as keyof typeof AVATAR_INFO]?.color || "#555" }}>
          {avatar[0].toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default function RoomLobby({ roomCode, players, state, isHost, onStartGame, onLeaveRoom, loading, error }: RoomLobbyProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [copied, setCopied] = useState(false)

  const diffOptions = [
    { value: "easy" as const, label: "FÁCIL", bg: "#16a34a", border: "#15803d" },
    { value: "medium" as const, label: "MEDIO", bg: "#b45309", border: "#92400e" },
    { value: "hard" as const, label: "DIFÍCIL", bg: "#7c3aed", border: "#5b21b6" },
  ]

  const handleCopyCode = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(roomCode)
      } else {
        const el = document.createElement("textarea")
        el.value = roomCode
        el.setAttribute("readonly", "")
        el.style.position = "absolute"
        el.style.left = "-9999px"
        document.body.appendChild(el)
        el.select()
        document.execCommand("copy")
        document.body.removeChild(el)
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 [@media(max-height:750px)]:p-2" style={{ imageRendering: "pixelated" }}>
      {/* Same background treatment as main menu */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{
        backgroundImage: "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
        backgroundSize: "4px 4px"
      }}/>
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)"
      }}/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)] pointer-events-none"/>

      {/* Ambient crosses */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(14)].map((_, i) => (
          <div key={i} className="absolute opacity-8" style={{ left: `${6 + (i * 6.8) % 90}%`, top: `${4 + (i * 7.1) % 88}%` }}>
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ imageRendering: "pixelated" }}>
              <rect x="5" y="0" width="2" height="12" fill="#fff"/>
              <rect x="0" y="5" width="12" height="2" fill="#fff"/>
            </svg>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md border border-white/15 bg-black/60 backdrop-blur-[2px] p-4 sm:p-6 [@media(max-height:750px)]:p-3"
      >
        {/* Header */}
        <div className="text-center mb-3 sm:mb-6 [@media(max-height:750px)]:mb-2">
          <div className="text-white/40 text-xs mb-1" style={{ fontFamily: "monospace" }}>SALA DE ESPERA</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1" style={{ fontFamily: "monospace", textShadow: "3px 3px 0 #ca8a04" }}>
            FOLLOW COIN
          </h1>
          <div className="mt-1 flex flex-row flex-wrap items-center justify-center gap-1">
            <div className="inline-block border border-yellow-400 bg-yellow-400/10 px-1.5 py-0.5">
              <span className="text-yellow-400 font-black text-xs tracking-[0.2em]" style={{ fontFamily: "monospace" }}>{roomCode}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyCode}
              className="h-6 px-1.5 border border-yellow-400/40 bg-yellow-400/10 font-black text-[9px] text-yellow-300 flex items-center gap-1"
              style={{ fontFamily: "monospace" }}
              aria-label="Copiar código"
              title="Copiar"
            >
              {copied ? (
                <Check className="w-2.5 h-2.5" />
              ) : (
                <Copy className="w-2.5 h-2.5" />
              )}
              <span>{copied ? "COPIADO" : "COPIAR"}</span>
            </motion.button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 border border-red-500/40 bg-red-500/10 p-3"
            >
              <p className="text-red-400 text-xs text-center" style={{ fontFamily: "monospace" }}>⚠ {error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Players list */}
        <div className="mb-4 sm:mb-5 [@media(max-height:750px)]:mb-3">
          <div className="text-white/50 text-xs font-black mb-2 flex items-center gap-2" style={{ fontFamily: "monospace" }}>
            <span>JUGADORES</span>
            <span className="text-yellow-400">{players.length}/5</span>
          </div>
          <div className="space-y-2">
            {players.map((player) => (
              <motion.div
                key={player.device_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between border border-white/10 bg-white/5 px-3 py-2 [@media(max-height:750px)]:py-1.5"
              >
                <div className="flex items-center gap-3">
                  <AvatarBox avatar={player.avatar} />
                  <span className="text-white text-sm font-black" style={{ fontFamily: "monospace" }}>{player.nickname}</span>
                  {player.is_host && (
                    <span className="text-yellow-400 text-xs font-black border border-yellow-400/40 px-1" style={{ fontFamily: "monospace" }}>HOST</span>
                  )}
                </div>
                <div className="w-2 h-2 bg-green-400"/>
              </motion.div>
            ))}
            {/* Empty slots */}
            <div className="hidden sm:block space-y-2">
              {[...Array(Math.max(0, 5 - players.length))].map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center border border-white/5 bg-white/2 px-3 py-2 opacity-30">
                  <div className="w-8 h-8 border border-dashed border-white/20 mr-3"/>
                  <span className="text-white/30 text-sm" style={{ fontFamily: "monospace" }}>Esperando...</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty (host only) */}
        {isHost && (
          <div className="mb-4 sm:mb-5 [@media(max-height:750px)]:mb-3">
            <div className="text-white/50 text-xs font-black mb-2" style={{ fontFamily: "monospace" }}>DIFICULTAD</div>
            <div className="flex gap-2">
              {diffOptions.map((d) => (
                <motion.button
                  key={d.value}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDifficulty(d.value)}
                  className="flex-1 py-2 px-1 border-b-2 font-black text-[10px] sm:text-xs transition-all text-center [@media(max-height:750px)]:py-1.5"
                  style={{
                    fontFamily: "monospace",
                    backgroundColor: selectedDifficulty === d.value ? d.bg : "rgba(255,255,255,0.05)",
                    borderColor: selectedDifficulty === d.value ? d.border : "rgba(255,255,255,0.15)",
                    color: selectedDifficulty === d.value ? "#fff" : "rgba(255,255,255,0.5)",
                  }}
                >
                  <div>{d.label}</div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Non-host waiting message */}
        {!isHost && (
          <div className="mb-5 border border-white/10 bg-white/5 p-3 text-center">
            <p className="text-white/50 text-xs" style={{ fontFamily: "monospace" }}>
              ⏳ Esperando que el host inicie la partida...
            </p>
            <p className="mt-1 text-white/35 text-[10px]" style={{ fontFamily: "monospace" }}>
              Juega una persona por ronda, las demás observan en simultáneo.
            
            </p>
          </div>
        )}

        {/* Minimum players warning */}
        {isHost && players.length < 2 && (
          <div className="mb-4 sm:mb-5 border border-yellow-500/40 bg-yellow-500/10 p-3 text-center [@media(max-height:750px)]:mb-3 [@media(max-height:750px)]:py-2">
            <p className="text-yellow-400 text-xs" style={{ fontFamily: "monospace" }}>
              ⚠ Se necesitan entre 2 y 5 jugadores para iniciar
            </p>
          </div>
        )}


        <div className="mb-4 border border-white/10 bg-white/5 p-3 text-center [@media(max-height:750px)]:mb-3 [@media(max-height:750px)]:py-2">
          <p className="text-white/55 text-[10px]" style={{ fontFamily: "monospace" }}>
            ORDEN DE TURNO: entran a la sala y juegan uno por uno.
          </p>
          <p className="mt-1 text-white/35 text-[10px]" style={{ fontFamily: "monospace" }}>
            Mientras un jugador está activo, los demás quedan en modo espectador.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isHost && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onStartGame(selectedDifficulty)}
              disabled={loading || players.length < 2 || players.length > 5}
              className="flex-1 h-11 border-b-4 border-[#059669] bg-[#10b981] font-black text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed [@media(max-height:750px)]:h-10"
              style={{ fontFamily: "monospace" }}
            >
              {loading ? "INICIANDO..." : "▶ INICIAR"}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onLeaveRoom}
            disabled={loading}
            className="h-11 min-w-[90px] border-b-4 border-[#ef4444] bg-[#dc2626] font-black text-white text-sm disabled:opacity-40 [@media(max-height:750px)]:h-10"
            style={{ fontFamily: "monospace" }}
          >
            SALIR
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
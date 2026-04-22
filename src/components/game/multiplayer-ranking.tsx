import { motion } from "framer-motion"
import { AVATAR_INFO } from "@/constants"
import { RoomPlayer, TurnState } from "@/src/lib/supabase/room"

interface MultiplayerRankingProps {
  roomPlayers: RoomPlayer[]
  turnState: TurnState
  onPlayAgain: () => void
  onBackToMenu: () => void
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

export default function MultiplayerRanking({ roomPlayers, turnState, onPlayAgain, onBackToMenu }: MultiplayerRankingProps) {
  const sorted = [...roomPlayers].sort((a, b) => (turnState.scores[b.id] || 0) - (turnState.scores[a.id] || 0))

  const medals = ["🥇", "🥈", "🥉"]
  const podiumColors = [
    { text: "text-yellow-400", border: "border-yellow-400/40", bg: "bg-yellow-400/10" },
    { text: "text-white/70", border: "border-white/20", bg: "bg-white/5" },
    { text: "text-orange-500", border: "border-orange-500/30", bg: "bg-orange-500/10" },
  ]

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4" style={{ imageRendering: "pixelated" }}>
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{
        backgroundImage: "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
        backgroundSize: "4px 4px"
      }}/>
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)"
      }}/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)] pointer-events-none"/>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md border border-white/15 bg-black/60 backdrop-blur-[2px] p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-yellow-400 text-3xl mb-2">🏆</div>
          <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: "monospace", textShadow: "3px 3px 0 #ca8a04" }}>
            JUEGO TERMINADO
          </h1>
          <div className="text-white/40 text-xs" style={{ fontFamily: "monospace" }}>RANKING FINAL</div>
        </div>

        {/* Rankings */}
        <div className="space-y-2 mb-6">
          {sorted.map((player, index) => {
            const score = turnState.scores[player.id] || 0
            const colors = podiumColors[index] || { text: "text-white/50", border: "border-white/10", bg: "bg-white/5" }
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between border px-4 py-3 ${colors.border} ${colors.bg}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{medals[index] || `#${index + 1}`}</span>
                  <AvatarBox avatar={player.avatar} />
                  <div>
                    <div className={`font-black text-sm ${colors.text}`} style={{ fontFamily: "monospace" }}>{player.nickname}</div>
                    {player.is_host && <div className="text-yellow-400/60 text-xs" style={{ fontFamily: "monospace" }}>HOST</div>}
                  </div>
                </div>
                <div className={`text-xl font-black ${colors.text}`} style={{ fontFamily: "monospace" }}>
                  {score} <span className="text-xs opacity-60">pts</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Winner callout */}
        {sorted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-6 border border-yellow-400/30 bg-yellow-400/5 py-3"
          >
            <div className="text-yellow-400 font-black text-sm" style={{ fontFamily: "monospace" }}>
              ★ {sorted[0].nickname.toUpperCase()} GANA ★
            </div>
            <div className="text-white/40 text-xs mt-1" style={{ fontFamily: "monospace" }}>
              {turnState.scores[sorted[0].id] || 0} puntos
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="flex-1 h-11 border-b-4 border-[#059669] bg-[#10b981] font-black text-white text-sm"
            style={{ fontFamily: "monospace" }}
          >
            ▶ JUGAR DE NUEVO
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onBackToMenu}
            className="flex-1 h-11 border-b-4 border-[#ef4444] bg-[#dc2626] font-black text-white text-sm"
            style={{ fontFamily: "monospace" }}
          >
            MENÚ
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
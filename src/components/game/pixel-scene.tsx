"use client"

import { motion, AnimatePresence, TargetAndTransition } from "framer-motion"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import PixelCharacter from "./pixel-character"
import { AvatarType, Burst, CoinPosition, GameStatus, ScoreEntry, Character } from "@/types"
import SimpleGameScene from "./simple-game-scene"
import EnhancedMultiplayerScene from "./enhanced-multiplayer-scene"
import MultiplayerRanking from "./multiplayer-ranking"
import { CHARACTERS, PARTICLE_COLORS, GAME_CONFIG, AVATAR_INFO } from "@/constants"
import { storage } from "@/utils"
import { RoomPlayer, RoomState, TurnState, createRoom, joinRoomByCode, startRoomGame, startTurnBasedGame, leaveRoom } from "@/lib/supabase/room"
import { subscribeToRoom } from "@/lib/supabase/realtime"
import { saveRoomScore, getTopScores, type TopScoreEntry } from "@/lib/supabase/scores"
import { getDeviceId } from "@/lib/game/device"
import RoomLobby from "@/components/room-lobby"

type PlayMode = "menu" | "solo" | "create-room" | "join-room" | "room-lobby"

function sortScores(scores: ScoreEntry[]) {
  return [...scores].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    return b.playedAt - a.playedAt
  })
}

// ─── Sound helper ─────────────────────────────────────────────────────────────
function beepSound(freq: number, duration: number, type: OscillatorType = "square", vol = 0.06) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
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
    setTimeout(() => ctx.close().catch(() => {}), 200)
  } catch {}
}

export default function PixelScene() {
  const [playMode, setPlayMode] = useState<PlayMode>("menu")
  const [roomCodeInput, setRoomCodeInput] = useState("")
  const [currentRoomCode, setCurrentRoomCode] = useState("")
  const [currentRoomId, setCurrentRoomId] = useState("")
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([])
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [roomError, setRoomError] = useState("")
  const [roomLoading, setRoomLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const [showEnhancedGame, setShowEnhancedGame] = useState(false)
  const [gameMode, setGameMode] = useState<"solo" | "room">("solo")
  const [gameRoomCode, setGameRoomCode] = useState<string>("")
  const [gameRoomId, setGameRoomId] = useState<string>("")
  const [gameDifficulty, setGameDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [showMultiplayerGame, setShowMultiplayerGame] = useState(false)
  const [showMultiplayerRanking, setShowMultiplayerRanking] = useState(false)
  const [currentTurnState, setCurrentTurnState] = useState<TurnState | null>(null)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)

  const [bursts, setBursts] = useState<Burst[]>([])
  const [mouse, setMouse] = useState({ x: 0, y: 0, active: false })

  // ── Easter egg: 8 fast clicks (max 500ms between each)
  const easterTimes = useRef<number[]>([])
  const [showEasterEgg, setShowEasterEgg] = useState<{ x: number; y: number; rotation: number } | null>(null)

  const [playerName, setPlayerName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>("Finn")
  const [bestScores, setBestScores] = useState<ScoreEntry[]>([])
  const [topScores, setTopScores] = useState<TopScoreEntry[]>([])
  const [scoresLoading, setScoresLoading] = useState(false)

  const [gameStatus, setGameStatus] = useState<GameStatus>("idle")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.GAME_TIME)
  const [coinPosition, setCoinPosition] = useState<CoinPosition>({ x: 50, y: 56 })

  const [sparklePositions, setSparklePositions] = useState<Array<{id: number, left: number, top: number, delay: number, repeatDelay: number}>>([])
  const [floatingParticles, setFloatingParticles] = useState<Array<{id: number, left: number, color: string, duration: number, delay: number, size: string}>>([])

  useEffect(() => {
    const savedScores = storage.getItem(GAME_CONFIG.SCORES_KEY)
    const savedPlayerName = storage.getItem(GAME_CONFIG.PLAYER_NAME_KEY)
    const savedAvatar = storage.getItem(GAME_CONFIG.PLAYER_AVATAR_KEY) as AvatarType | null

    if (savedScores) {
      try { setBestScores(sortScores(JSON.parse(savedScores)).slice(0, 3)) } catch { setBestScores([]) }
    }
    if (savedPlayerName) setPlayerName(savedPlayerName)
    if (savedAvatar && AVATAR_INFO[savedAvatar]) setSelectedAvatar(savedAvatar)

    setSparklePositions([...Array(12)].map((_, i) => ({
      id: i, left: 10 + Math.random() * 80, top: 8 + Math.random() * 60,
      delay: 1 + Math.random() * 2.5, repeatDelay: Math.random() * 3,
    })))
    setFloatingParticles([...Array(24)].map((_, i) => ({
      id: i, left: Math.random() * 100,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      duration: 4 + Math.random() * 4, delay: 1 + Math.random() * 4,
      size: Math.random() > 0.5 ? "w-1 h-1 md:w-2 md:h-2" : "w-1.5 h-1.5",
    })))
  }, [])

  useEffect(() => {
    const loadTopScores = async () => {
      try {
        setScoresLoading(true)
        const scores = await getTopScores(3)
        setTopScores(scores)
      } catch {}
      finally { setScoresLoading(false) }
    }
    loadTopScores()
  }, [])

  useEffect(() => { storage.setItem(GAME_CONFIG.PLAYER_NAME_KEY, playerName) }, [playerName])
  useEffect(() => { storage.setItem(GAME_CONFIG.PLAYER_AVATAR_KEY, selectedAvatar) }, [selectedAvatar])

  useEffect(() => {
    if (gameStatus !== "playing" || timeLeft <= 0) return
    const timer = window.setTimeout(() => setTimeLeft((p) => p - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [timeLeft, gameStatus])

  useEffect(() => {
    if (gameStatus === "playing" && timeLeft <= 0) finishGame()
  }, [timeLeft, gameStatus])

  useEffect(() => {
    if (!currentRoomCode) return
    let unsub: (() => void) | null = null

    const setup = async () => {
      unsub = subscribeToRoom(currentRoomCode, {
        onSnapshot: (snapshot) => {
          if (!snapshot.room) {
            setRoomError("La sala ya no existe")
            handleLeaveRoom()
            return
          }

          setRoomPlayers(snapshot.players)
          setRoomState(snapshot.state)

          const payload = (snapshot.state?.payload as any) ?? {}
          const ts = payload.turnState as TurnState | undefined

          if (ts) {
            setCurrentTurnState(ts)
            setCurrentPlayerIndex(ts.current_player_index)
          }

          if (snapshot.state?.phase === "playing") {
            setGameMode("room")
            setGameRoomCode(currentRoomCode)
            setGameRoomId(snapshot.room.id)
            setShowMultiplayerGame(true)
            setPlayMode("menu")
            setShowMultiplayerRanking(false)
          }

          if (snapshot.state?.phase === "turn-transition") {
            setShowMultiplayerGame(true)
          }

          if (snapshot.state?.phase === "finished") {
            setShowMultiplayerGame(false)
            setShowMultiplayerRanking(true)
          }
        },
        onError: (e) => setRoomError(e.message),
      })
    }
    setup()
    return () => {
      unsub?.()
      setShowMultiplayerGame(false); setShowMultiplayerRanking(false)
      setCurrentTurnState(null); setCurrentPlayerIndex(0)
      setRoomLoading(false)
    }
  }, [currentRoomCode])

  const isRoomHost = roomPlayers.some(p => p.device_id === getDeviceId() && p.is_host)

  function playCoinSound() { beepSound(880, 0.05); setTimeout(() => beepSound(1180, 0.06), 50); setTimeout(() => beepSound(1480, 0.08, "triangle"), 100) }
  function playStartSound() { beepSound(440, 0.06); setTimeout(() => beepSound(554, 0.06), 80); setTimeout(() => beepSound(659, 0.06), 160); setTimeout(() => beepSound(880, 0.1), 240) }
  function playEndSound() { beepSound(659, 0.08); setTimeout(() => beepSound(440, 0.1), 90); setTimeout(() => beepSound(330, 0.15), 180) }
  function playClickSound() { beepSound(460, 0.04, "square", 0.03) }
  function playEasterSound() { [523,659,784,1047,1319].forEach((f,i) => setTimeout(() => beepSound(f, 0.1), i * 70)) }

  function randomCoinPosition() { return { x: 18 + Math.random() * 64, y: 30 + Math.random() * 34 } }

  function saveScore(entry: ScoreEntry) {
    const updated = sortScores([entry, ...bestScores]).slice(0, 3)
    setBestScores(updated)
    storage.setJSON(GAME_CONFIG.SCORES_KEY, updated)
  }

  async function finishGame() {
    setGameStatus("finished")
    playEndSound()
    if (gameMode === "room" && gameRoomId && gameRoomCode) {
      try {
        await saveRoomScore(gameRoomId, gameRoomCode, playerName.trim(), selectedAvatar, score)
        const scores = await getTopScores(3)
        setTopScores(scores)
      } catch {}
    } else {
      saveScore({ id: `${Date.now()}-${Math.random()}`, name: playerName.trim() || "Invitado", avatar: selectedAvatar, score, playedAt: Date.now() })
    }
  }

  function startGame(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    setScore(0); setTimeLeft(GAME_CONFIG.GAME_TIME); setCoinPosition(randomCoinPosition()); setGameStatus("playing"); playStartSound()
  }

  function catchCoin(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    if (gameStatus !== "playing") return
    setScore(p => p + 1); setCoinPosition(randomCoinPosition()); playCoinSound()
  }

  function handleSceneClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now() + Math.random()
    setBursts(p => [...p, { id, x, y }])
    playClickSound()
    setTimeout(() => setBursts(p => p.filter(b => b.id !== id)), 800)

    // Easter egg: 7 rapid clicks within 2s each
    const now = Date.now()
    const recent = easterTimes.current.filter(t => now - t < 2000)
    recent.push(now)
    easterTimes.current = recent
    console.log("Easter egg clicks:", recent.length, "times:", recent)
    if (recent.length >= 7) {
      easterTimes.current = []
      console.log("Easter egg triggered!")
      setShowEasterEgg({ x, y, rotation: Math.random() * 30 - 15 }) // random rotation -15 to 15 degrees
      playEasterSound()
      setTimeout(() => setShowEasterEgg(null), 2200)
    }
  }

  async function handleCreateRoom() {
    if (!playerName.trim()) { setRoomError("Por favor ingresa tu nombre"); return }
    setRoomLoading(true); setRoomError("")
    try {
      const result = await createRoom({ nickname: playerName.trim(), avatar: selectedAvatar, deviceId: getDeviceId(), maxPlayers: 5, selectedLevel: 1 })
      setCurrentRoomCode(result.room.code); setCurrentRoomId(result.room.id)
      setRoomPlayers([result.player]); setRoomState(result.state); setPlayMode("room-lobby")
    } catch (e) { setRoomError(e instanceof Error ? e.message : "Error al crear la sala") }
    finally { setRoomLoading(false) }
  }

  async function handleJoinRoom() {
    if (!playerName.trim()) { setRoomError("Ingresa tu nombre"); return }
    if (!roomCodeInput.trim()) { setRoomError("Ingresa el código de sala"); return }
    setRoomLoading(true); setRoomError("")
    try {
      const result = await joinRoomByCode({ code: roomCodeInput.trim(), nickname: playerName.trim(), avatar: selectedAvatar, deviceId: getDeviceId() })
      setCurrentRoomCode(roomCodeInput.trim().toUpperCase()); setCurrentRoomId(result.room.id)
      setRoomPlayers([result.player]); setRoomState(null); setPlayMode("room-lobby"); setRoomCodeInput("")
    } catch (e) { setRoomError(e instanceof Error ? e.message : "Error al unirse") }
    finally { setRoomLoading(false) }
  }

  async function handleStartGame(difficulty: "easy" | "medium" | "hard") {
    if (!currentRoomId) return
    setRoomLoading(true); setRoomError(""); setGameDifficulty(difficulty)
    try {
      await startTurnBasedGame(currentRoomId, difficulty)
    } catch (e) {
      setRoomError(e instanceof Error ? e.message : "Error al iniciar")
      setRoomLoading(false)
    } finally {
      setRoomLoading(false)
    }
  }

  async function handleLeaveRoom() {
    if (currentRoomId && getDeviceId()) {
      try { await leaveRoom(currentRoomId, getDeviceId()) } catch {}
    }
    setCurrentRoomCode(""); setCurrentRoomId(""); setRoomPlayers([]); setRoomState(null)
    setRoomError(""); setRoomLoading(false); setPlayMode("menu")
  }

  function handlePlaySolo() { setGameMode("solo"); setGameRoomCode(""); setGameRoomId(""); setShowEnhancedGame(true) }

async function handlePlayerFinish(score: number) {
  if (!currentRoomId) return

  try {
    const { finishPlayerTurn, nextPlayerTurn } = await import("@/lib/supabase/room")
    const activePlayerId = currentTurnState?.current_player_id
    const currentPlayer = roomPlayers.find((player) => player.id === activePlayerId)

    if (!currentPlayer) return
    if (currentPlayer.device_id !== getDeviceId()) return

    await finishPlayerTurn(currentRoomId, currentPlayer.id, score)
    await nextPlayerTurn(currentRoomId)
  } catch (error) {
    console.error("Error al finalizar turno:", error)
  }
}
  function handlePlayAgain() {
    setShowMultiplayerRanking(false); setShowMultiplayerGame(false)
    setCurrentTurnState(null); setCurrentPlayerIndex(0); setRoomLoading(false); setPlayMode("room-lobby")
  }

  function handleBackToMenu() {
    setShowMultiplayerRanking(false); setShowMultiplayerGame(false)
    setCurrentTurnState(null); setCurrentPlayerIndex(0)
    setGameMode("solo"); setGameRoomCode(""); setGameRoomId(""); setGameDifficulty("easy")
    setRoomLoading(false); setPlayMode("menu"); handleLeaveRoom()
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true })
  }

  // ── Screen routing ──
  if (showMultiplayerGame && currentTurnState) {
    // Get difficulty from room state payload to ensure all players use the same difficulty
    const difficultyFromRoom = (roomState?.payload as any)?.difficulty
  const roomDifficulty =
  ((roomState?.payload as any)?.difficulty as "easy" | "medium" | "hard" | undefined) || gameDifficulty
    return (
     <EnhancedMultiplayerScene
        roomId={currentRoomId}
        roomState={roomState}
        playerName={playerName}
        selectedAvatar={selectedAvatar}
        roomPlayers={roomPlayers}
        difficulty={roomDifficulty}
        isCurrentPlayerTurn={roomPlayers[currentPlayerIndex]?.device_id === getDeviceId()}
        currentPlayerIndex={currentPlayerIndex}
        turnState={currentTurnState}
        onBack={handleBackToMenu}
        onPlayerFinish={handlePlayerFinish}
      />
    )
  }

  if (showMultiplayerRanking && currentTurnState) {
    return (
      <MultiplayerRanking
        roomPlayers={roomPlayers} turnState={currentTurnState}
        onPlayAgain={handlePlayAgain} onBackToMenu={handleBackToMenu}
      />
    )
  }

  if (showEnhancedGame) {
    return (
      <SimpleGameScene
        playerName={playerName} selectedAvatar={selectedAvatar}
        onBack={() => setShowEnhancedGame(false)}
        difficulty={gameMode === "room" ? gameDifficulty : undefined}
        isMultiplayer={false}
      />
    )
  }

  if (playMode === "room-lobby") {
    return (
      <RoomLobby
        roomCode={currentRoomCode} players={roomPlayers} state={roomState}
        isHost={isRoomHost} onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom} loading={roomLoading} error={roomError}
      />
    )
  }

  // ── Main Menu ──
  return (
    <div
      ref={containerRef}
      onClick={handleSceneClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse(p => ({ ...p, active: false }))}
      className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-6"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Pixel grid */}
      <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none" style={{
        backgroundImage: "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
        backgroundSize: "4px 4px"
      }}/>
      {/* Scanlines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)"
      }}/>
      {/* Vignette */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)] pointer-events-none"/>

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {floatingParticles.map((p) => (
          <motion.div key={p.id} className={`absolute ${p.size}`}
            style={{ left: `${p.left}%`, backgroundColor: p.color }}
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 1, 1, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
          />
        ))}
      </div>

      {/* Sparkles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {sparklePositions.map((s) => (
          <motion.div key={s.id} className="absolute"
            style={{ left: `${s.left}%`, top: `${s.top}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: s.delay, repeatDelay: s.repeatDelay }}
          >
            <Sparkle />
          </motion.div>
        ))}
      </div>

      {/* Pixel crosses ambient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="absolute opacity-10"
            style={{ left: `${6 + (i * 6.1) % 90}%`, top: `${4 + (i * 7.3) % 88}%` }}>
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ imageRendering: "pixelated" }}>
              <rect x="5" y="0" width="2" height="12" fill="#fff"/>
              <rect x="0" y="5" width="12" height="2" fill="#fff"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Click bursts */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        {bursts.map((burst) => (
          <div key={burst.id}>
            <motion.div className="absolute rounded-full border border-white/30"
              style={{ left: burst.x, top: burst.y, width: 12, height: 12, transform: "translate(-50%,-50%)" }}
              initial={{ scale: 0.4, opacity: 0.8 }}
              animate={{ scale: 8, opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i / 14) * Math.PI * 2
              const dist = 28 + (i % 3) * 10
              return (
                <motion.div key={`${burst.id}-${i}`} className="absolute"
                  style={{ left: burst.x, top: burst.y, width: i % 2 === 0 ? 6 : 8, height: i % 2 === 0 ? 6 : 8, backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length], transform: "translate(-50%,-50%)" }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col items-center justify-center gap-6 lg:grid lg:grid-cols-[1fr_300px] lg:items-center lg:gap-8">
        <div className="flex w-full flex-col items-center">
          <ArcadeMessage />
          <Instructions />

          <AvatarSelector selected={selectedAvatar} onSelect={setSelectedAvatar} characters={CHARACTERS} />

          <div className="mb-4 w-full max-w-md border border-white/15 bg-black/55 backdrop-blur-[2px] p-4">
            <div className="flex w-full flex-col gap-2">
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Escribe tu nombre"
                className="h-10 flex-1 border-b-4 border-white/25 bg-black/40 px-4 text-center text-sm text-white outline-none placeholder:text-white/30 font-black focus:border-yellow-400/70 focus:bg-black/55"
                style={{ fontFamily: "monospace" }}
              />
            </div>

            {/* Game mode buttons */}
            <div className="mt-3 flex w-full flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={handlePlaySolo}
                disabled={!playerName.trim()}
                className="h-10 w-full border-b-4 border-[#ca8a04] bg-[#facc15] px-4 font-black text-xs text-[#1f2937] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "monospace" }}
              >
                ▶ JUGAR SOLO
              </motion.button>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim() || roomLoading}
                  className="flex-1 h-10 border-b-4 border-[#059669] bg-[#10b981] px-3 font-black text-xs text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "monospace" }}
                >
                  {roomLoading ? "..." : "+ SALA"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setPlayMode("join-room")}
                  disabled={!playerName.trim()}
                  className="flex-1 h-10 border-b-4 border-[#7c3aed] bg-[#8b5cf6] px-3 font-black text-xs text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "monospace" }}
                >
                  UNIRSE
                </motion.button>
              </div>
            </div>

            {/* Join room panel */}
            <AnimatePresence>
              {playMode === "join-room" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="w-full border border-white/15 bg-white/5 p-3"
                >
                  <p className="text-white/50 text-xs mb-2 text-center" style={{ fontFamily: "monospace" }}>CÓDIGO DE SALA</p>
                  <div className="flex gap-2">
                    <input
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="XXXXXX"
                      className="flex-1 h-11 border border-white/20 bg-black/40 px-4 text-center font-black text-white outline-none placeholder:text-white/30 tracking-widest"
                      style={{ fontFamily: "monospace" }}
                      maxLength={6}
                    />
                    <motion.button
                      whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                      onClick={handleJoinRoom}
                      disabled={!roomCodeInput.trim() || roomLoading}
                      className="h-11 min-w-[90px] border-b-4 border-[#7c3aed] bg-[#8b5cf6] px-3 font-black text-sm text-white disabled:opacity-40"
                      style={{ fontFamily: "monospace" }}
                    >
                      {roomLoading ? "..." : "ENTRAR"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setPlayMode("menu"); setRoomCodeInput(""); setRoomError("") }}
                      className="h-11 min-w-[50px] border-b-4 border-[#ef4444] bg-[#f87171] px-3 font-black text-sm text-white"
                      style={{ fontFamily: "monospace" }}
                    >✕</motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {roomError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="w-full border border-red-500/40 bg-red-500/10 p-3"
                >
                  <p className="text-red-400 text-xs text-center" style={{ fontFamily: "monospace" }}>⚠ {roomError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Characters display + coin */}
          <div className="relative flex min-h-[180px] w-full items-end justify-center">
            <div className="relative z-10 flex flex-wrap items-end justify-center gap-4 px-4 md:gap-8 lg:gap-12">
              {CHARACTERS.map((char) => (
                <CharacterHover
                  key={char.id}
                  type={char.type}
                  isSelected={selectedAvatar === char.type}
                  onClick={() => setSelectedAvatar(char.type as AvatarType)}
                >
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
                  style={{ left: `${coinPosition.x}%`, top: `${coinPosition.y}%`, transform: "translate(-50%,-50%)" }}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ scale: { duration: 0.3 }, rotate: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } }}
                >
                  <Coin />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-8 left-1/2 z-0 h-px w-[90%] max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
          </div>
        </div>
      </div>

      {/* Easter egg */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute z-9999 pointer-events-none"
            style={{
              left: showEasterEgg.x,
              top: showEasterEgg.y,
              transform: `translate(-50%, -50%) rotate(${showEasterEgg.rotation}deg)`,
            }}
          >
            <img
              src="/easterEgg.png"
              alt="Easter Egg"
              className="max-w-xs max-h-xs"
              style={{ imageRendering: "pixelated" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────


function AvatarSelector({ selected, onSelect, characters }: { selected: AvatarType, onSelect: (a: AvatarType) => void, characters: typeof CHARACTERS }) {
  const imgs: Record<string, string> = { Kirby: "/kirby.png", Pikachu: "/pikachu.png", Finn: "/fin.png", AmongUs: "/amongus.png", Robot: "/robot.png", Mage: "/mage.png" }
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.4 }} className="mb-3">
      <p className="text-xs text-white/50 text-center mb-2 font-black" style={{ fontFamily: "monospace" }}>SELECCIONA TU AVATAR</p>
      <div className="flex items-center justify-center gap-2">
        {characters.map((char) => {
          const at = char.type as AvatarType
          const isSelected = selected === at
          return (
            <motion.button key={char.id} onClick={() => onSelect(at)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              className={`relative w-12 h-12 md:w-14 md:h-14 border-2 flex items-center justify-center overflow-hidden transition-all ${
                isSelected ? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_12px_rgba(250,204,21,0.4)]" : "border-white/15 bg-white/5 hover:border-white/30"
              }`}
              title={AVATAR_INFO[at]?.label || char.type}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 relative">
                {imgs[char.type] ? (
                  <img src={imgs[char.type]} alt={char.type} className="w-full h-full object-cover" style={{ imageRendering: "pixelated" }}/>
                ) : (
                  <PixelCharacter type={char.type} color={char.color} delay={0} />
                )}
              </div>
              {isSelected && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 flex items-center justify-center border-2 border-black">
                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

function CharacterHover({ type, children, isSelected, onClick }: { type: string, children: React.ReactNode, isSelected?: boolean, onClick?: () => void }) {
  const anims: Record<string, { whileHover: TargetAndTransition, transition: any }> = {
    Mario: { whileHover: { y: -8, rotate: -4, scale: 1.05 }, transition: { type: "spring", stiffness: 260, damping: 12 } },
    Kirby: { whileHover: { scaleX: 1.1, scaleY: 0.92, y: -4 }, transition: { type: "spring", stiffness: 260, damping: 12 } },
    Pikachu: { whileHover: { rotate: [0, -6, 6, -4, 0], y: -4, scale: 1.05 }, transition: { duration: 0.5 } },
    Robot: { whileHover: { y: -6, rotate: 3, scale: 1.05 }, transition: { type: "spring", stiffness: 220, damping: 10 } },
    Luigi: { whileHover: { y: [-2, -10, -4], x: [0, 4, -2, 0], scale: 1.05 }, transition: { duration: 0.8, repeat: Infinity } },
  }
  const cfg = anims[type] ?? { whileHover: { scale: 1.05 }, transition: { duration: 0.25 } }
  return (
    <motion.div whileHover={cfg.whileHover} transition={cfg.transition} onClick={onClick}
      className={`cursor-pointer relative ${isSelected ? "ring-2 ring-yellow-400" : ""}`}
    >
      {children}
      {isSelected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 flex items-center justify-center border-2 border-black z-20"
        >
          <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
}

function ArcadeMessage() {
  const rows = ["FOLLOW", "COIN"]
  return (
    <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.45 }}
      className="mb-5 flex select-none flex-col items-center gap-0"
    >
      {rows.map((row, ri) => (
        <div key={row} className="flex items-center justify-center gap-0">
          {row.split("").map((letter, i) => (
            <motion.span key={`${row}-${i}`}
              initial={{ opacity: 0, scale: 0.75, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.9 + ri * 0.12 + i * 0.04, duration: 0.2 }}
              className="font-black leading-none text-white text-[28px] md:text-[48px]"
              style={{ fontFamily: "monospace", textShadow: "4px 4px 0 #ca8a04, 2px 2px 0 #78350f" }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      ))}
    </motion.div>
  )
}

function Instructions() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.4 }} className="mb-2 text-center">
      <p className="text-xs text-white/70 mb-1 font-black" style={{ fontFamily: "monospace" }}>Elige tu modo: Individual o Multijugador</p>
      <p className="text-xs text-white/40" style={{ fontFamily: "monospace" }}>Crea o únete a una sala privada por código</p>
    </motion.div>
  )
}

function Coin() {
  return (
    <svg width="34" height="34" viewBox="0 0 16 16" className="h-9 w-9 md:h-11 md:w-11" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="1" width="8" height="1" fill="#facc15"/>
      <rect x="3" y="2" width="10" height="1" fill="#facc15"/>
      <rect x="2" y="3" width="12" height="1" fill="#facc15"/>
      <rect x="2" y="4" width="12" height="1" fill="#facc15"/>
      <rect x="1" y="5" width="14" height="1" fill="#facc15"/>
      <rect x="1" y="6" width="14" height="1" fill="#facc15"/>
      <rect x="1" y="7" width="14" height="1" fill="#facc15"/>
      <rect x="1" y="8" width="14" height="1" fill="#facc15"/>
      <rect x="1" y="9" width="14" height="1" fill="#facc15"/>
      <rect x="2" y="10" width="12" height="1" fill="#facc15"/>
      <rect x="2" y="11" width="12" height="1" fill="#facc15"/>
      <rect x="3" y="12" width="10" height="1" fill="#facc15"/>
      <rect x="4" y="13" width="8" height="1" fill="#facc15"/>
      <rect x="5" y="3" width="1" height="9" fill="#fde68a"/>
      <rect x="6" y="2" width="2" height="11" fill="#fde68a"/>
      <rect x="8" y="4" width="1" height="6" fill="#ca8a04"/>
      <rect x="9" y="3" width="1" height="8" fill="#ca8a04"/>
    </svg>
  )
}

function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="md:w-6 md:h-6">
      <rect x="7" y="0" width="2" height="4" fill="#fff"/>
      <rect x="7" y="12" width="2" height="4" fill="#fff"/>
      <rect x="0" y="7" width="4" height="2" fill="#fff"/>
      <rect x="12" y="7" width="4" height="2" fill="#fff"/>
      <rect x="7" y="7" width="2" height="2" fill="#fff"/>
    </svg>
  )
}

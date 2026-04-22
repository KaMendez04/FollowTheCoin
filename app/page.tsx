"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import PixelScene from "@/src/components/game/pixel-scene"

export default function Home() {
  const [showScene, setShowScene] = useState(false)

  return (
    <main className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!showScene ? (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-6"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <Image
                src="/logo.png"
                alt="Moneda pixeleada"
                width={110}
                height={110}
                loading="eager"
                style={{ imageRendering: "pixelated" }}
                className="drop-shadow-[0_0_25px_rgba(255,215,0,0.35)]"
              />

              <h1 className="mt-3 text-white font-black text-2xl md:text-4xl tracking-wide">
                Sigue la moneda
              </h1>
            </motion.div>

            {/* Botón */}
            <button
              onClick={() => setShowScene(true)}
              className="group relative px-10 py-5 bg-white text-black font-bold text-lg md:text-xl rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Presióname</span>
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white via-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="scene"
            initial={{ scale: 0, borderRadius: "100%" }}
            animate={{ scale: 1, borderRadius: "0%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-[#0a0a1a]"
          >
            <PixelScene />
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}
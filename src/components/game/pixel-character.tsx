"use client"

import { motion } from "framer-motion"
import { PixelCharacterProps } from "@/types"

export default function PixelCharacter({ type, delay }: PixelCharacterProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 0.6,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 1.5 + Math.random() * 2,
          ease: "easeInOut",
        }}
      >
        {type === "Finn"    && <FinnCharacter />}
        {type === "Mage"    && <MageCharacter />}
        {type === "Pikachu" && <PikachuCharacter />}
        {type === "Robot"   && <RobotCharacter />}
        {type === "AmongUs" && <AmongUsCharacter />}
      </motion.div>
    </motion.div>
  )
}

function FinnCharacter() {
  return (
    <motion.div
      className="relative w-20 h-32 md:w-24 md:h-36"
      initial={{ scale: 0.96 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ transform: "translateZ(0)" }}
    >
      <svg
        viewBox="0 -2 20 34"
        className="w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,0.35)]"
        style={{
          imageRendering: "pixelated",
          shapeRendering: "crispEdges",
        }}
      >
        {/* Mochila izquierda */}
        <rect x="1" y="14" width="2" height="7" fill="#65d436" />
        <rect x="2" y="14" width="1" height="7" fill="#3f9f1e" />
        <rect x="0" y="15" width="1" height="5" fill="#111111" />

        {/* Mochila derecha */}
        <rect x="17" y="14" width="2" height="7" fill="#65d436" />
        <rect x="17" y="14" width="1" height="7" fill="#3f9f1e" />
        <rect x="19" y="15" width="1" height="5" fill="#111111" />

        {/* Gorro outline */}
        <rect x="4" y="1" width="2" height="1" fill="#111111" />
        <rect x="14" y="1" width="2" height="1" fill="#111111" />
        <rect x="6" y="2" width="8" height="1" fill="#111111" />
        <rect x="4" y="2" width="1" height="11" fill="#111111" />
        <rect x="15" y="2" width="1" height="11" fill="#111111" />
        <rect x="6" y="13" width="8" height="1" fill="#111111" />

        {/* Gorro */}
        <rect x="4" y="2" width="2" height="3" fill="#f3f3f3" />
        <rect x="14" y="2" width="2" height="3" fill="#f3f3f3" />
        <rect x="4" y="5" width="12" height="8" fill="#f3f3f3" />
        <rect x="6" y="3" width="8" height="2" fill="#f3f3f3" />

        {/* Sombra gorro */}
        <rect x="15" y="5" width="1" height="8" fill="#d6d6d6" />
        <rect x="5" y="12" width="10" height="1" fill="#dfdfdf" />

        {/* Cara contorno */}
        <rect x="6" y="6" width="8" height="1" fill="#7d675f" />
        <rect x="5" y="7" width="1" height="5" fill="#7d675f" />
        <rect x="14" y="7" width="1" height="5" fill="#7d675f" />
        <rect x="6" y="12" width="8" height="1" fill="#7d675f" />

        {/* Cara */}
        <rect x="6" y="7" width="8" height="5" fill="#f3c2a8" />

        {/* Ojos */}
        <rect x="7" y="8" width="1" height="2" fill="#111111" />
        <rect x="12" y="8" width="1" height="2" fill="#111111" />

        {/* Nariz */}
        <rect x="9" y="9" width="1" height="1" fill="#111111" />

        {/* Boca corregida: recta y simple */}
        <rect x="8" y="10" width="3" height="1" fill="#111111" />

        {/* Cuello */}
        <rect x="8" y="13" width="4" height="1" fill="#f3c2a8" />

        {/* Tirantes mochila */}
        <rect x="4" y="14" width="2" height="7" fill="#57b926" />
        <rect x="14" y="14" width="2" height="7" fill="#57b926" />
        <rect x="5" y="14" width="1" height="7" fill="#377c18" />
        <rect x="14" y="14" width="1" height="7" fill="#377c18" />

        {/* Camiseta */}
        <rect x="4" y="14" width="12" height="1" fill="#111111" />
        <rect x="4" y="15" width="12" height="6" fill="#22ace2" />
        <rect x="5" y="15" width="10" height="5" fill="#29b8ee" />
        <rect x="4" y="20" width="12" height="1" fill="#0c668e" />

        {/* Mangas */}
        <rect x="3" y="15" width="2" height="3" fill="#22ace2" />
        <rect x="15" y="15" width="2" height="3" fill="#22ace2" />
        <rect x="3" y="17" width="2" height="1" fill="#0c668e" />
        <rect x="15" y="17" width="2" height="1" fill="#0c668e" />

        {/* Brazos */}
        <rect x="3" y="18" width="2" height="7" fill="#f3c2a8" />
        <rect x="15" y="18" width="2" height="7" fill="#f3c2a8" />

        {/* Outline torso */}
        <rect x="4" y="15" width="1" height="7" fill="#111111" />
        <rect x="15" y="15" width="1" height="7" fill="#111111" />

        {/* Short */}
        <rect x="5" y="21" width="10" height="1" fill="#111111" />
        <rect x="5" y="22" width="10" height="4" fill="#144db8" />
        <rect x="9" y="22" width="2" height="4" fill="#0d388f" />

        {/* Separación de piernas en short */}
        <rect x="9" y="25" width="2" height="2" fill="#111111" />

        {/* Bordes bajos del short */}
        <rect x="5" y="25" width="2" height="1" fill="#144db8" />
        <rect x="13" y="25" width="2" height="1" fill="#144db8" />

        {/* Outline short */}
        <rect x="5" y="22" width="1" height="4" fill="#111111" />
        <rect x="14" y="22" width="1" height="4" fill="#111111" />

        {/* Piernas */}
        <rect x="6" y="26" width="2" height="4" fill="#f3c2a8" />
        <rect x="12" y="26" width="2" height="4" fill="#f3c2a8" />

        {/* Outline piernas */}
        <rect x="6" y="26" width="1" height="4" fill="#111111" />
        <rect x="13" y="26" width="1" height="4" fill="#111111" />

        {/* Calcetas */}
        <rect x="6" y="30" width="2" height="1" fill="#efefef" />
        <rect x="12" y="30" width="2" height="1" fill="#efefef" />

        {/* Zapatos */}
        <rect x="5" y="31" width="3" height="1" fill="#1f1f1f" />
        <rect x="12" y="31" width="3" height="1" fill="#1f1f1f" />
      </svg>
    </motion.div>
  )
}

// ─── Among Us — morado ─────────────────────────────────────────────────────────
function AmongUsCharacter() {
  return (
    <motion.div className="relative w-20 h-28 md:w-24 md:h-32">
      <svg
        viewBox="0 0 20 28"
        className="w-full h-full"
        style={{ imageRendering: "pixelated" }}
      >
        {/* BACKPACK */}
        <rect x="2" y="9" width="3" height="9" fill="#7a39b8" />
        <rect x="1" y="10" width="1" height="7" fill="#111111" />
        <rect x="2" y="8" width="3" height="1" fill="#111111" />
        <rect x="5" y="9" width="1" height="9" fill="#111111" />
        <rect x="2" y="18" width="3" height="1" fill="#111111" />

        {/* CUERPO OUTLINE */}
        <rect x="6" y="4" width="8" height="1" fill="#111111" />
        <rect x="5" y="5" width="10" height="1" fill="#111111" />
        <rect x="4" y="6" width="12" height="1" fill="#111111" />
        <rect x="3" y="7" width="14" height="1" fill="#111111" />
        <rect x="3" y="8" width="1" height="13" fill="#111111" />
        <rect x="16" y="8" width="1" height="13" fill="#111111" />
        <rect x="4" y="21" width="4" height="1" fill="#111111" />
        <rect x="12" y="21" width="4" height="1" fill="#111111" />
        <rect x="4" y="22" width="1" height="4" fill="#111111" />
        <rect x="7" y="22" width="1" height="4" fill="#111111" />
        <rect x="12" y="22" width="1" height="4" fill="#111111" />
        <rect x="15" y="22" width="1" height="4" fill="#111111" />
        <rect x="5" y="26" width="3" height="1" fill="#111111" />
        <rect x="12" y="26" width="4" height="1" fill="#111111" />

        {/* CUERPO MORADO */}
        <rect x="6" y="5" width="8" height="1" fill="#8f46d8" />
        <rect x="5" y="6" width="10" height="1" fill="#8f46d8" />
        <rect x="4" y="7" width="12" height="1" fill="#8f46d8" />
        <rect x="4" y="8" width="12" height="13" fill="#8f46d8" />
        <rect x="5" y="21" width="3" height="5" fill="#8f46d8" />
        <rect x="13" y="21" width="2" height="5" fill="#8f46d8" />

        {/* SOMBRA CUERPO */}
        <rect x="13" y="6" width="2" height="15" fill="#6d2fa8" />
        <rect x="14" y="21" width="1" height="5" fill="#6d2fa8" />
        <rect x="5" y="20" width="10" height="1" fill="#7a39b8" />

        {/* VISOR OUTLINE */}
        <rect x="7" y="7" width="6" height="1" fill="#111111" />
        <rect x="6" y="8" width="8" height="1" fill="#111111" />
        <rect x="5" y="9" width="10" height="1" fill="#111111" />
        <rect x="5" y="10" width="10" height="4" fill="#111111" />
        <rect x="6" y="14" width="8" height="1" fill="#111111" />
        <rect x="7" y="15" width="6" height="1" fill="#111111" />

        {/* VISOR */}
        <rect x="7" y="8" width="6" height="1" fill="#c8d8e2" />
        <rect x="6" y="9" width="8" height="1" fill="#c8d8e2" />
        <rect x="6" y="10" width="8" height="4" fill="#b7cad6" />
        <rect x="7" y="14" width="6" height="1" fill="#9db4c1" />

        {/* BRILLO VISOR */}
        <rect x="8" y="9" width="3" height="1" fill="#ffffff" />
        <rect x="7" y="10" width="4" height="1" fill="#eaf4fa" />
        <rect x="7" y="11" width="2" height="1" fill="#eaf4fa" />
      </svg>
    </motion.div>
  )
}

// MageCharacter.js
function MageCharacter() {
  return (
    <motion.div
      className="relative w-20 h-32 md:w-24 md:h-36"
      initial={{ scale: 0.96 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ transform: "translateZ(0)" }}
    >
      <svg
        viewBox="0 0 20 32"
        className="w-full h-full drop-shadow-[2px_2px_0_rgba(0,0,0,0.35)]"
        style={{
          imageRendering: "pixelated",
          shapeRendering: "crispEdges",
        }}
      >
        {/* ===== BASTÓN (Corregido y sombreado) ===== */}
        <rect x="3" y="12" width="1" height="15" fill="#6f4325" />
        <rect x="3" y="12" width="1" height="15" fill="#9b6239" />
        <rect x="4" y="25" width="2" height="1" fill="#d9a54d" />
        <rect x="3" y="9" width="2" height="2" fill="#ff63b5" />
        <rect x="4" y="9" width="1" height="1" fill="#ffe1f0" />
        <rect x="1" y="10" width="1" height="1" fill="#6f4325" />
        <rect x="5" y="10" width="1" height="1" fill="#6f4325" />

        {/* ===== SOMBRERO GRANDE (Reescrito para sombreado) ===== */}
        {/* Contorno inferior del ala */}
        <rect x="5" y="10" width="15" height="1" fill="#111111" />
        {/* Ala del sombrero (Sombreado gradiente rosa) */}
        <rect x="4" y="8" width="17" height="1" fill="#f34ea6" />
        <rect x="5" y="9" width="15" height="1" fill="#ff7fc7" />
        {/* Contorno superior del ala */}
        <rect x="5" y="7" width="15" height="1" fill="#111111" />
        <rect x="4" y="8" width="1" height="1" fill="#111111" />
        <rect x="16" y="8" width="1" height="1" fill="#111111" />

        {/* Cuerpo del sombrero (Sombreado gradiente rosa) */}
        <rect x="7" y="5" width="11" height="2" fill="#ff86c9" />
        <rect x="6" y="4" width="9" height="1" fill="#ff71bf" />
        <rect x="8" y="3" width="7" height="1" fill="#ff5fb2" />
        <rect x="10" y="2" width="5" height="1" fill="#ff5fb2" />
        {/* Punta del sombrero (Sombreado gradiente rosa) */}
        <rect x="11" y="1" width="3" height="1" fill="#ff5fb2" />
        {/* Contorno del cuerpo */}
        <rect x="11" y="1" width="3" height="1" fill="#111111" />
        <rect x="10" y="2" width="1" height="5" fill="#111111" />
        <rect x="14" y="2" width="1" height="5" fill="#111111" />

        {/* Cinta y Estrella (Colores corregidos) */}
        <rect x="8" y="6" width="5" height="1" fill="#ffd8ec" />
        <rect x="14" y="4" width="1" height="1" fill="#ffd35a" />
        <rect x="15" y="5" width="3" height="1" fill="#ffd35a" />
        <rect x="13" y="6" width="1" height="1" fill="#ffd35a" />

        {/* ===== CABELLO (Rediseñado con sombreado y mechones) ===== */}
        <rect x="7" y="11" width="10" height="6" fill="#111111" />
        <rect x="7" y="11" width="8" height="5" fill="#ff92cc" />
        {/* Sombreado de mechones */}
        <rect x="6" y="12" width="1" height="4" fill="#f35cab" />
        <rect x="12" y="12" width="1" height="4" fill="#f35cab" />
        <rect x="9" y="11" width="1" height="1" fill="#f35cab" />
        <rect x="10" y="11" width="1" height="1" fill="#f35cab" />

        {/* Mechones frontales específicos */}
        <rect x="7" y="16" width="1" height="1" fill="#e44a9d" />
        <rect x="12" y="16" width="1" height="1" fill="#e44a9d" />
        <rect x="8" y="16" width="6" height="1" fill="#111111" />

        {/* ===== CARA (Añadido rubor y sombreado de piel) ===== */}
        <rect x="8" y="12" width="4" height="4" fill="#f7dbc9" />
        <rect x="8" y="13" width="1" height="2" fill="#f7dbc9" />
        <rect x="12" y="13" width="1" height="2" fill="#f7dbc9" />
        {/* Sombreado de piel inferior */}
        <rect x="8" y="16" width="4" height="1" fill="#e8bca3" />

        {/* Ojos y Boca */}
        <rect x="8" y="13" width="1" height="2" fill="#111111" />
        <rect x="11" y="13" width="1" height="2" fill="#111111" />
        <rect x="9" y="15" width="2" height="1" fill="#111111" />

        {/* MEJILLAS (El detalle que faltaba) */}
        <rect x="7" y="15" width="1" height="1" fill="#ffb0d8" />
        <rect x="12" y="15" width="1" height="1" fill="#ffb0d8" />

        {/* Cuello */}
        <rect x="9" y="17" width="2" height="1" fill="#f7dbc9" />

        {/* ===== HOMBROS / CAPA (Sombreado y forma orgánica) ===== */}
        <rect x="6" y="17" width="8" height="3" fill="#111111" />
        {/* Solapas de la capa (Rosa sombreado) */}
        <rect x="6" y="18" width="8" height="2" fill="#f34ea6" />
        <rect x="7" y="19" width="6" height="1" fill="#ff86c9" />
        {/* Contorno inferior de la capa */}
        <rect x="5" y="18" width="10" height="2" fill="#111111" />

        {/* Broche (Corregido forma y gema) */}
        <rect x="11" y="18" width="2" height="2" fill="#ffd35a" />
        <rect x="11" y="18" width="1" height="1" fill="#fff0ad" />

        {/* ===== BRAZOS (Sombreado y puños dorados) ===== */}
        <rect x="5" y="19" width="2" height="6" fill="#f34ea6" />
        <rect x="16" y="19" width="2" height="6" fill="#f34ea6" />
        {/* Sombras de los brazos */}
        <rect x="5" y="19" width="1" height="6" fill="#d53d8b" />
        <rect x="16" y="19" width="1" height="6" fill="#d53d8b" />
        {/* Puños Dorados */}
        <rect x="4" y="24" width="2" height="1" fill="#ffd35a" />
        <rect x="13" y="24" width="2" height="1" fill="#ffd35a" />
        {/* Manos */}
        <rect x="5" y="25" width="2" height="1" fill="#f7dbc9" />
        <rect x="13" y="25" width="2" height="1" fill="#f7dbc9" />

        {/* ===== VESTIDO (Recreado con gradientes y marco dorado) ===== */}
        <rect x="5" y="21" width="8" height="8" fill="#111111" />
        <rect x="8" y="22" width="8" height="6" fill="#f34ea6" />
        <rect x="7" y="23" width="6" height="4" fill="#ff93cc" />
        <rect x="8" y="24" width="4" height="2" fill="#ffbadf" />

        {/* MARCO DORADO DEL VESTIDO (El otro detalle que faltaba) */}
        <rect x="8" y="22" width="1" height="6" fill="#ffd35a" />
        <rect x="15" y="22" width="1" height="6" fill="#ffd35a" />
        <rect x="8" y="26" width="8" height="1" fill="#ffd35a" />

        {/* ===== PIES (Sombreado) ===== */}
        <rect x="10" y="29" width="2" height="2" fill="#111111" />
        <rect x="13" y="29" width="2" height="2" fill="#111111" />
        <rect x="10" y="29" width="2" height="1" fill="#ff4ea8" />
        <rect x="13" y="29" width="2" height="1" fill="#ff4ea8" />
        <rect x="9" y="30" width="2" height="1" fill="#b82d77" />
        <rect x="12" y="30" width="2" height="1" fill="#b82d77" />
      </svg>
    </motion.div>
  )
}
// ─── Pikachu ───────────────────────────────────────────────────────────────────
function PikachuCharacter() {
  return (
    <motion.div className="relative w-20 h-24 md:w-24 md:h-28">
      <svg viewBox="0 0 20 24" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="2" height="1" fill="#000000" />
        <rect x="2" y="1" width="3" height="1" fill="#000000" />
        <rect x="3" y="2" width="2" height="1" fill="#000000" />
        <rect x="3" y="3" width="2" height="1" fill="#ffd700" />
        <rect x="4" y="4" width="2" height="1" fill="#ffd700" />
        <rect x="4" y="5" width="2" height="2" fill="#ffd700" />
        <rect x="16" y="0" width="2" height="1" fill="#000000" />
        <rect x="15" y="1" width="3" height="1" fill="#000000" />
        <rect x="15" y="2" width="2" height="1" fill="#000000" />
        <rect x="15" y="3" width="2" height="1" fill="#ffd700" />
        <rect x="14" y="4" width="2" height="1" fill="#ffd700" />
        <rect x="14" y="5" width="2" height="2" fill="#ffd700" />
        <rect x="6" y="4" width="8" height="1" fill="#ffd700" />
        <rect x="5" y="5" width="10" height="1" fill="#ffd700" />
        <rect x="4" y="6" width="12" height="1" fill="#ffd700" />
        <rect x="3" y="7" width="14" height="1" fill="#ffd700" />
        <rect x="3" y="8" width="14" height="1" fill="#ffd700" />
        <rect x="3" y="9" width="14" height="1" fill="#ffd700" />
        <rect x="4" y="10" width="12" height="1" fill="#ffd700" />
        <rect x="5" y="11" width="10" height="1" fill="#ffd700" />
        <rect x="5" y="7" width="3" height="3" fill="#000000" />
        <rect x="12" y="7" width="3" height="3" fill="#000000" />
        <rect x="6" y="7" width="1" height="1" fill="#ffffff" />
        <rect x="13" y="7" width="1" height="1" fill="#ffffff" />
        <rect x="2" y="8" width="2" height="2" fill="#ff3333" />
        <rect x="16" y="8" width="2" height="2" fill="#ff3333" />
        <rect x="9" y="9" width="2" height="1" fill="#000000" />
        <rect x="8" y="10" width="1" height="1" fill="#000000" />
        <rect x="11" y="10" width="1" height="1" fill="#000000" />
        <rect x="6" y="12" width="8" height="1" fill="#ffd700" />
        <rect x="5" y="13" width="10" height="1" fill="#ffd700" />
        <rect x="4" y="14" width="12" height="1" fill="#ffd700" />
        <rect x="4" y="15" width="12" height="1" fill="#ffd700" />
        <rect x="5" y="16" width="10" height="1" fill="#ffd700" />
        <rect x="6" y="17" width="8" height="1" fill="#ffd700" />
        <rect x="2" y="13" width="3" height="3" fill="#ffd700" />
        <rect x="15" y="13" width="3" height="3" fill="#ffd700" />
        <motion.g
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ transformOrigin: "16px 18px" }}
        >
          <rect x="16" y="14" width="2" height="3" fill="#cc9900" />
          <rect x="17" y="12" width="2" height="3" fill="#ffd700" />
          <rect x="18" y="10" width="2" height="3" fill="#ffd700" />
          <rect x="16" y="8" width="3" height="3" fill="#ffd700" />
          <rect x="14" y="7" width="3" height="2" fill="#ffd700" />
        </motion.g>
        <rect x="5" y="18" width="4" height="2" fill="#ffd700" />
        <rect x="11" y="18" width="4" height="2" fill="#ffd700" />
        <rect x="4" y="19" width="5" height="2" fill="#ffd700" />
        <rect x="11" y="19" width="5" height="2" fill="#ffd700" />
      </svg>
    </motion.div>
  )
}

// ─── Robot ─────────────────────────────────────────────────────────────────────
function RobotCharacter() {
  return (
    <motion.div className="relative w-18 h-28 md:w-22 md:h-32">
      <svg viewBox="0 0 18 28" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
        <rect x="8" y="0" width="2" height="2" fill="#78909c" />
        <motion.rect
          x="7" y="0" width="4" height="1" fill="#00bcd4"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        <rect x="4" y="2" width="10" height="1" fill="#ffffff" />
        <rect x="3" y="3" width="12" height="1" fill="#ffffff" />
        <rect x="2" y="4" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="5" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="6" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="7" width="14" height="1" fill="#ffffff" />
        <rect x="3" y="8" width="12" height="1" fill="#ffffff" />
        <rect x="4" y="9" width="10" height="1" fill="#ffffff" />
        <rect x="3" y="4" width="12" height="4" fill="#0d47a1" />
        <motion.g
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2.5 }}
        >
          <rect x="4" y="5" width="2" height="2" fill="#00e5ff" />
          <rect x="7" y="5" width="1" height="2" fill="#00e5ff" />
          <rect x="10" y="5" width="1" height="2" fill="#00e5ff" />
          <rect x="12" y="5" width="2" height="2" fill="#00e5ff" />
        </motion.g>
        <rect x="7" y="10" width="4" height="1" fill="#b0bec5" />
        <rect x="4" y="11" width="10" height="1" fill="#ffffff" />
        <rect x="3" y="12" width="12" height="1" fill="#ffffff" />
        <rect x="2" y="13" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="14" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="15" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="16" width="14" height="1" fill="#ffffff" />
        <rect x="3" y="17" width="12" height="1" fill="#ffffff" />
        <rect x="4" y="18" width="10" height="1" fill="#ffffff" />
        <rect x="6" y="13" width="6" height="3" fill="#eceff1" />
        <rect x="7" y="14" width="4" height="1" fill="#00bcd4" />
        <motion.g
          animate={{ rotate: [0, 20, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
          style={{ transformOrigin: "2px 13px" }}
        >
          <rect x="0" y="12" width="2" height="5" fill="#b0bec5" />
          <rect x="0" y="17" width="2" height="2" fill="#78909c" />
        </motion.g>
        <rect x="16" y="12" width="2" height="5" fill="#b0bec5" />
        <rect x="16" y="17" width="2" height="2" fill="#78909c" />
        <rect x="5" y="19" width="3" height="4" fill="#00bcd4" />
        <rect x="10" y="19" width="3" height="4" fill="#00bcd4" />
        <rect x="4" y="23" width="4" height="2" fill="#78909c" />
        <rect x="10" y="23" width="4" height="2" fill="#78909c" />
      </svg>
    </motion.div>
  )
}
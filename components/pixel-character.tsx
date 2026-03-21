"use client"

import { motion } from "framer-motion"

interface PixelCharacterProps {
  type: string
  color: string
  delay: number
}

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
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 1.5 + Math.random() * 2,
          ease: "easeInOut",
        }}
      >
        {type === "hero" && <MarioCharacter />}
        {type === "blob" && <KirbyCharacter />}
        {type === "creature" && <PikachuCharacter />}
        {type === "robot" && <RobotCharacter />}
        {type === "ghost" && <LuigiCharacter />}
      </motion.div>
    </motion.div>
  )
}

// Mario - classic pixel art with a more expressive face
function MarioCharacter() {
  return (
    <motion.div className="relative w-24 h-32 md:w-28 md:h-36">
      <svg viewBox="0 0 16 22" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
        {/* Cap */}
        <rect x="4" y="0" width="5" height="1" fill="#e52521" />
        <rect x="3" y="1" width="8" height="1" fill="#e52521" />
        <rect x="2" y="2" width="10" height="1" fill="#e52521" />
        <rect x="2" y="3" width="10" height="1" fill="#e52521" />
        <rect x="6" y="2" width="2" height="1" fill="#ffffff" opacity="0.9" />
        <rect x="9" y="3" width="2" height="1" fill="#b71c1c" />

        {/* Hair / sideburns */}
        <rect x="2" y="4" width="2" height="1" fill="#6b3500" />
        <rect x="1" y="5" width="2" height="1" fill="#6b3500" />
        <rect x="1" y="6" width="1" height="2" fill="#6b3500" />
        <rect x="2" y="8" width="1" height="1" fill="#6b3500" />

        {/* Face */}
        <rect x="5" y="4" width="6" height="1" fill="#ffc8a0" />
        <rect x="4" y="5" width="7" height="1" fill="#ffc8a0" />
        <rect x="4" y="6" width="7" height="1" fill="#ffc8a0" />
        <rect x="3" y="7" width="8" height="1" fill="#ffc8a0" />
        <rect x="4" y="8" width="7" height="1" fill="#ffc8a0" />
        <rect x="5" y="9" width="5" height="1" fill="#ffc8a0" />

        {/* Brows */}
        <rect x="5" y="4" width="2" height="1" fill="#6b3500" />
        <rect x="8" y="4" width="2" height="1" fill="#6b3500" />

        {/* Eyes */}
        <rect x="5" y="5" width="1" height="2" fill="#000000" />
        <rect x="8" y="5" width="1" height="2" fill="#000000" />
        <rect x="5" y="5" width="1" height="1" fill="#ffffff" />
        <rect x="8" y="5" width="1" height="1" fill="#ffffff" />

        {/* Nose */}
        <rect x="9" y="6" width="1" height="2" fill="#e8a07a" />
        <rect x="10" y="7" width="1" height="1" fill="#e8a07a" />

        {/* Mustache */}
        <rect x="5" y="8" width="2" height="1" fill="#6b3500" />
        <rect x="7" y="7" width="2" height="2" fill="#6b3500" />
        <rect x="9" y="8" width="1" height="1" fill="#6b3500" />

        {/* Shirt */}
        <rect x="5" y="10" width="6" height="1" fill="#e52521" />
        <rect x="4" y="11" width="8" height="1" fill="#e52521" />
        <rect x="2" y="12" width="11" height="1" fill="#e52521" />

        {/* Blue overalls with straps */}
        <rect x="5" y="11" width="2" height="1" fill="#2038ec" />
        <rect x="8" y="11" width="2" height="1" fill="#2038ec" />
        <rect x="4" y="13" width="8" height="1" fill="#2038ec" />
        <rect x="4" y="14" width="8" height="1" fill="#2038ec" />

        {/* Yellow buttons */}
        <rect x="5" y="13" width="1" height="1" fill="#fbd000" />
        <rect x="9" y="13" width="1" height="1" fill="#fbd000" />

        {/* Left arm reaching forward */}
        <rect x="12" y="11" width="2" height="2" fill="#e52521" />
        <rect x="13" y="13" width="2" height="1" fill="#ffc8a0" />

        {/* Right arm back */}
        <rect x="1" y="12" width="2" height="2" fill="#e52521" />
        <rect x="0" y="13" width="2" height="1" fill="#ffc8a0" />

        {/* Running legs */}
        <rect x="7" y="15" width="3" height="1" fill="#2038ec" />
        <rect x="9" y="16" width="3" height="1" fill="#2038ec" />
        <rect x="10" y="17" width="3" height="2" fill="#6b3500" />

        <rect x="4" y="15" width="3" height="2" fill="#2038ec" />
        <rect x="2" y="17" width="3" height="1" fill="#6b3500" />
        <rect x="1" y="18" width="3" height="1" fill="#6b3500" />
      </svg>
    </motion.div>
  )
}

// Kirby - pink round blob with red feet
function KirbyCharacter() {
  return (
    <motion.div className="relative w-20 h-20 md:w-24 md:h-24">
      <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
        {/* Body - pink round shape */}
        <rect x="5" y="1" width="6" height="1" fill="#ffb6c1" />
        <rect x="3" y="2" width="10" height="1" fill="#ffb6c1" />
        <rect x="2" y="3" width="12" height="1" fill="#ffb6c1" />
        <rect x="1" y="4" width="14" height="1" fill="#ffb6c1" />
        <rect x="1" y="5" width="14" height="1" fill="#ffb6c1" />
        <rect x="1" y="6" width="14" height="1" fill="#ffb6c1" />
        <rect x="1" y="7" width="14" height="1" fill="#ffb6c1" />
        <rect x="1" y="8" width="14" height="1" fill="#ffb6c1" />
        <rect x="1" y="9" width="14" height="1" fill="#ffb6c1" />
        <rect x="2" y="10" width="12" height="1" fill="#ffb6c1" />
        <rect x="3" y="11" width="10" height="1" fill="#ffb6c1" />
        <rect x="4" y="12" width="8" height="1" fill="#ffb6c1" />

        {/* Highlight on body */}
        <rect x="10" y="3" width="2" height="2" fill="#ffd1dc" />
        <rect x="11" y="5" width="2" height="1" fill="#ffd1dc" />

        {/* Shadow on body */}
        <rect x="2" y="8" width="2" height="2" fill="#ff8da1" />
        <rect x="3" y="10" width="2" height="1" fill="#ff8da1" />

        {/* Eyes - large ovals with highlights */}
        <rect x="4" y="5" width="3" height="4" fill="#000033" />
        <rect x="9" y="5" width="3" height="4" fill="#000033" />
        {/* Eye highlights */}
        <rect x="5" y="5" width="1" height="2" fill="#ffffff" />
        <rect x="10" y="5" width="1" height="2" fill="#ffffff" />
        {/* Eye reflection bottom */}
        <rect x="4" y="8" width="1" height="1" fill="#6666ff" />
        <rect x="9" y="8" width="1" height="1" fill="#6666ff" />

        {/* Blush/cheeks */}
        <rect x="2" y="7" width="2" height="2" fill="#ff6b8a" opacity="0.7" />
        <rect x="12" y="7" width="2" height="2" fill="#ff6b8a" opacity="0.7" />

        {/* Mouth - small cute smile */}
        <rect x="7" y="9" width="2" height="1" fill="#ff6699" />

        {/* Feet - red/magenta */}
        <motion.g
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1.2 }}
        >
          <rect x="2" y="12" width="4" height="3" fill="#cc0066" />
          <rect x="1" y="13" width="5" height="2" fill="#cc0066" />
          <rect x="2" y="12" width="1" height="1" fill="#ff3399" />
        </motion.g>
        <motion.g
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1.2, delay: 0.2 }}
        >
          <rect x="10" y="12" width="4" height="3" fill="#cc0066" />
          <rect x="10" y="13" width="5" height="2" fill="#cc0066" />
          <rect x="13" y="12" width="1" height="1" fill="#ff3399" />
        </motion.g>
      </svg>
    </motion.div>
  )
}

// Pikachu - yellow electric mouse
function PikachuCharacter() {
  return (
    <motion.div className="relative w-20 h-24 md:w-24 md:h-28">
      <svg viewBox="0 0 20 24" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
        {/* Left ear */}
        <rect x="2" y="0" width="2" height="1" fill="#000000" />
        <rect x="2" y="1" width="3" height="1" fill="#000000" />
        <rect x="3" y="2" width="2" height="1" fill="#000000" />
        <rect x="3" y="3" width="2" height="1" fill="#ffd700" />
        <rect x="4" y="4" width="2" height="1" fill="#ffd700" />
        <rect x="4" y="5" width="2" height="2" fill="#ffd700" />

        {/* Right ear */}
        <rect x="16" y="0" width="2" height="1" fill="#000000" />
        <rect x="15" y="1" width="3" height="1" fill="#000000" />
        <rect x="15" y="2" width="2" height="1" fill="#000000" />
        <rect x="15" y="3" width="2" height="1" fill="#ffd700" />
        <rect x="14" y="4" width="2" height="1" fill="#ffd700" />
        <rect x="14" y="5" width="2" height="2" fill="#ffd700" />

        {/* Head */}
        <rect x="6" y="4" width="8" height="1" fill="#ffd700" />
        <rect x="5" y="5" width="10" height="1" fill="#ffd700" />
        <rect x="4" y="6" width="12" height="1" fill="#ffd700" />
        <rect x="3" y="7" width="14" height="1" fill="#ffd700" />
        <rect x="3" y="8" width="14" height="1" fill="#ffd700" />
        <rect x="3" y="9" width="14" height="1" fill="#ffd700" />
        <rect x="4" y="10" width="12" height="1" fill="#ffd700" />
        <rect x="5" y="11" width="10" height="1" fill="#ffd700" />

        {/* Eyes */}
        <rect x="5" y="7" width="3" height="3" fill="#000000" />
        <rect x="12" y="7" width="3" height="3" fill="#000000" />
        {/* Eye highlights */}
        <rect x="6" y="7" width="1" height="1" fill="#ffffff" />
        <rect x="13" y="7" width="1" height="1" fill="#ffffff" />

        {/* Red cheeks */}
        <rect x="2" y="8" width="2" height="2" fill="#ff3333" />
        <rect x="16" y="8" width="2" height="2" fill="#ff3333" />

        {/* Nose */}
        <rect x="9" y="9" width="2" height="1" fill="#000000" />

        {/* Mouth */}
        <rect x="8" y="10" width="1" height="1" fill="#000000" />
        <rect x="11" y="10" width="1" height="1" fill="#000000" />

        {/* Body */}
        <rect x="6" y="12" width="8" height="1" fill="#ffd700" />
        <rect x="5" y="13" width="10" height="1" fill="#ffd700" />
        <rect x="4" y="14" width="12" height="1" fill="#ffd700" />
        <rect x="4" y="15" width="12" height="1" fill="#ffd700" />
        <rect x="5" y="16" width="10" height="1" fill="#ffd700" />
        <rect x="6" y="17" width="8" height="1" fill="#ffd700" />

        {/* Arms */}
        <rect x="2" y="13" width="3" height="3" fill="#ffd700" />
        <rect x="15" y="13" width="3" height="3" fill="#ffd700" />

        {/* Tail */}
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

        {/* Feet */}
        <rect x="5" y="18" width="4" height="2" fill="#ffd700" />
        <rect x="11" y="18" width="4" height="2" fill="#ffd700" />
        <rect x="4" y="19" width="5" height="2" fill="#ffd700" />
        <rect x="11" y="19" width="5" height="2" fill="#ffd700" />
      </svg>
    </motion.div>
  )
}

// Robot - white/blue with visor based on reference
function RobotCharacter() {
  return (
    <motion.div className="relative w-18 h-28 md:w-22 md:h-32">
      <svg viewBox="0 0 18 28" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
        {/* Antenna */}
        <rect x="8" y="0" width="2" height="2" fill="#78909c" />
        <motion.rect
          x="7"
          y="0"
          width="4"
          height="1"
          fill="#00bcd4"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        {/* Head - rounded white */}
        <rect x="4" y="2" width="10" height="1" fill="#ffffff" />
        <rect x="3" y="3" width="12" height="1" fill="#ffffff" />
        <rect x="2" y="4" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="5" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="6" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="7" width="14" height="1" fill="#ffffff" />
        <rect x="3" y="8" width="12" height="1" fill="#ffffff" />
        <rect x="4" y="9" width="10" height="1" fill="#ffffff" />

        {/* Visor/face screen - blue */}
        <rect x="3" y="4" width="12" height="4" fill="#0d47a1" />

        {/* Eyes on visor - cyan pixels */}
        <motion.g
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2.5 }}
        >
          <rect x="4" y="5" width="2" height="2" fill="#00e5ff" />
          <rect x="7" y="5" width="1" height="2" fill="#00e5ff" />
          <rect x="10" y="5" width="1" height="2" fill="#00e5ff" />
          <rect x="12" y="5" width="2" height="2" fill="#00e5ff" />
        </motion.g>

        {/* Neck */}
        <rect x="7" y="10" width="4" height="1" fill="#b0bec5" />

        {/* Body - white with gray accents */}
        <rect x="4" y="11" width="10" height="1" fill="#ffffff" />
        <rect x="3" y="12" width="12" height="1" fill="#ffffff" />
        <rect x="2" y="13" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="14" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="15" width="14" height="1" fill="#ffffff" />
        <rect x="2" y="16" width="14" height="1" fill="#ffffff" />
        <rect x="3" y="17" width="12" height="1" fill="#ffffff" />
        <rect x="4" y="18" width="10" height="1" fill="#ffffff" />

        {/* Chest panel */}
        <rect x="6" y="13" width="6" height="3" fill="#eceff1" />
        <rect x="7" y="14" width="4" height="1" fill="#00bcd4" />

        {/* Arms - gray/white */}
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

        {/* Legs - cyan/gray */}
        <rect x="5" y="19" width="3" height="4" fill="#00bcd4" />
        <rect x="10" y="19" width="3" height="4" fill="#00bcd4" />

        {/* Feet */}
        <rect x="4" y="23" width="4" height="2" fill="#78909c" />
        <rect x="10" y="23" width="4" height="2" fill="#78909c" />
      </svg>
    </motion.div>
  )
}

// Luigi - cleaner face, better balanced features
function LuigiCharacter() {
  return (
    <motion.div className="relative w-24 h-32 md:w-28 md:h-36">
      <svg viewBox="0 0 16 22" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
        {/* Green cap */}
        <rect x="4" y="0" width="5" height="1" fill="#4caf50" />
        <rect x="3" y="1" width="8" height="1" fill="#4caf50" />
        <rect x="2" y="2" width="10" height="1" fill="#4caf50" />
        <rect x="2" y="3" width="10" height="1" fill="#4caf50" />
        <rect x="6" y="2" width="2" height="1" fill="#ffffff" opacity="0.9" />
        <rect x="9" y="3" width="2" height="1" fill="#2e7d32" />

        {/* Hair / sideburns */}
        <rect x="2" y="4" width="2" height="1" fill="#6b3500" />
        <rect x="1" y="5" width="2" height="1" fill="#6b3500" />
        <rect x="1" y="6" width="1" height="2" fill="#6b3500" />
        <rect x="2" y="8" width="1" height="1" fill="#6b3500" />

        {/* Face - slimmer than Mario */}
        <rect x="5" y="4" width="6" height="1" fill="#ffc8a0" />
        <rect x="4" y="5" width="7" height="1" fill="#ffc8a0" />
        <rect x="4" y="6" width="7" height="1" fill="#ffc8a0" />
        <rect x="3" y="7" width="8" height="1" fill="#ffc8a0" />
        <rect x="4" y="8" width="7" height="1" fill="#ffc8a0" />
        <rect x="5" y="9" width="4" height="1" fill="#ffc8a0" />

        {/* Brows */}
        <rect x="5" y="4" width="2" height="1" fill="#6b3500" />
        <rect x="8" y="4" width="2" height="1" fill="#6b3500" />

        {/* Eyes */}
        <rect x="5" y="5" width="1" height="2" fill="#000000" />
        <rect x="8" y="5" width="1" height="2" fill="#000000" />
        <rect x="5" y="5" width="1" height="1" fill="#ffffff" />
        <rect x="8" y="5" width="1" height="1" fill="#ffffff" />

        {/* Nose */}
        <rect x="9" y="6" width="1" height="2" fill="#e8a07a" />
        <rect x="10" y="7" width="1" height="1" fill="#e8a07a" />

        {/* Mustache */}
        <rect x="6" y="8" width="1" height="1" fill="#6b3500" />
        <rect x="7" y="7" width="2" height="2" fill="#6b3500" />
        <rect x="9" y="8" width="1" height="1" fill="#6b3500" />

        {/* Chin */}
        <rect x="6" y="9" width="3" height="1" fill="#ffc8a0" />
        
        {/* Green shirt */}
        <rect x="5" y="10" width="6" height="1" fill="#4caf50" />
        <rect x="4" y="11" width="8" height="1" fill="#4caf50" />
        <rect x="2" y="12" width="11" height="1" fill="#4caf50" />

        {/* Blue overalls with straps */}
        <rect x="5" y="11" width="2" height="1" fill="#2038ec" />
        <rect x="8" y="11" width="2" height="1" fill="#2038ec" />
        <rect x="4" y="13" width="8" height="1" fill="#2038ec" />
        <rect x="4" y="14" width="8" height="1" fill="#2038ec" />

        {/* Yellow buttons */}
        <rect x="5" y="13" width="1" height="1" fill="#fbd000" />
        <rect x="9" y="13" width="1" height="1" fill="#fbd000" />

        {/* Arms */}
        <rect x="0" y="11" width="3" height="3" fill="#4caf50" />
        <rect x="12" y="11" width="3" height="3" fill="#4caf50" />
        <rect x="0" y="14" width="2" height="1" fill="#ffc8a0" />
        <rect x="13" y="14" width="2" height="1" fill="#ffc8a0" />

        {/* Legs */}
        <rect x="4" y="15" width="3" height="3" fill="#2038ec" />
        <rect x="9" y="15" width="3" height="3" fill="#2038ec" />

        {/* Shoes */}
        <rect x="3" y="18" width="4" height="2" fill="#6b3500" />
        <rect x="9" y="18" width="4" height="2" fill="#6b3500" />
      </svg>
    </motion.div>
  )
}
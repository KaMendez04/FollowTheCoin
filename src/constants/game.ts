export const GAME_CONFIG = {
  GAME_TIME: 20,
  SCORES_KEY: "pixel_scene_top_scores",
  PLAYER_NAME_KEY: "pixel_scene_player_name",
  PLAYER_AVATAR_KEY: "pixel_scene_player_avatar",
} as const

export const CHARACTERS = [
  { id: 1, type: "Finn",    color: "#2d8fc9", delay: 0.2 },
  { id: 2, type: "Mage",    color: "#ff5fb2", delay: 0.4 },
  { id: 3, type: "Pikachu", color: "#ffd700", delay: 0.6 },
  { id: 4, type: "Robot",   color: "#ffffff", delay: 0.8 },
  { id: 5, type: "AmongUs", color: "#7b2fbe", delay: 1.0 },
] as const
 
export const AVATAR_INFO = {
  Finn:    { label: "Finn el Humano", color: "#2d8fc9" },
  Mage:    { label: "Mage",           color: "#ff5fb2" },
  Pikachu: { label: "Pikachu",        color: "#ffd700" },
  Robot:   { label: "Robot",          color: "#b0bec5" },
  AmongUs: { label: "Among Us",       color: "#7b2fbe" },
} as const
 
export const PARTICLE_COLORS = ["#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#2ecc71", "#ffffff"]
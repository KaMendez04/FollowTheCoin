export const GAME_CONFIG = {
  GAME_TIME: 20,
  SCORES_KEY: "pixel_scene_top_scores",
  PLAYER_NAME_KEY: "pixel_scene_player_name",
  PLAYER_AVATAR_KEY: "pixel_scene_player_avatar",
} as const

export const CHARACTERS = [
  { id: 1, type: "Mario", color: "#e74c3c", delay: 0.2 },
  { id: 2, type: "Kirby", color: "#ff69b4", delay: 0.4 },
  { id: 3, type: "Pikachu", color: "#f1c40f", delay: 0.6 },
  { id: 4, type: "Robot", color: "#3498db", delay: 0.8 },
  { id: 5, type: "Luigi", color: "#9b59b6", delay: 1.0 },
] as const

export const PARTICLE_COLORS = ["#e74c3c", "#f1c40f", "#3498db", "#9b59b6", "#2ecc71", "#ffffff"]

export const AVATAR_INFO = {
  Mario: { label: "Mario", color: "#e74c3c" },
  Kirby: { label: "Kirby", color: "#ff69b4" },
  Pikachu: { label: "Pikachu", color: "#f1c40f" },
  Robot: { label: "Robot", color: "#3498db" },
  Luigi: { label: "Luigi", color: "#9b59b6" },
} as const

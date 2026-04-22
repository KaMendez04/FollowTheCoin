import { GameLevel } from "@/types/game-enhanced"

export const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    name: "Fácil",
    difficulty: "easy",
    objectCount: 15,
    timeLimit: 30,
    gridSize: { width: 100, height: 100 }
  },
  {
    id: 2,
    name: "Medio",
    difficulty: "medium",
    objectCount: 25,
    timeLimit: 25,
    gridSize: { width: 100, height: 100 }
  },
  {
    id: 3,
    name: "Difícil",
    difficulty: "hard",
    objectCount: 40,
    timeLimit: 20,
    gridSize: { width: 100, height: 100 }
  }
]

export const DECOY_OBJECTS = [
  { 
    type: "rock", 
    emoji: "Rock", 
    color: "#8B8680",
    design: "rock"
  },
  { 
    type: "tree", 
    emoji: "Tree", 
    color: "#228B22",
    design: "tree"
  },
  { 
    type: "bush", 
    emoji: "Bush", 
    color: "#2E7D32",
    design: "bush"
  },
  { 
    type: "flower", 
    emoji: "Flower", 
    color: "#FF69B4",
    design: "flower"
  },
  { 
    type: "mushroom", 
    emoji: "Mushroom", 
    color: "#DC143C",
    design: "mushroom"
  },
  { 
    type: "crystal", 
    emoji: "Crystal", 
    color: "#00CED1",
    design: "crystal"
  }
]

export const GAME_CONFIG_ENHANCED = {
  COIN_SIZE: 50,
  CHARACTER_SIZE: 45,
  GRID_CELL_SIZE: 10,
  ANIMATION_DURATION: 300,
  HINT_COOLDOWN: 5000
} as const

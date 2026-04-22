-- Create table for game scores
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL,
  player_nickname TEXT NOT NULL,
  player_avatar TEXT,
  score INTEGER NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_played_at ON game_scores(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_room_code ON game_scores(room_code);

-- Enable Row Level Security
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Create policy for reading scores (everyone can read)
CREATE POLICY "Anyone can view game scores" ON game_scores
  FOR SELECT USING (true);

-- Create policy for inserting scores (authenticated users can insert)
CREATE POLICY "Authenticated users can insert game scores" ON game_scores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

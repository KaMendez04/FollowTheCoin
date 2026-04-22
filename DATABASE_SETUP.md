# Database Setup Instructions

## Issue
The application is failing to load global scores because the `game_scores` table doesn't exist in the database.

## Solution
You need to manually create the `game_scores` table in your Supabase dashboard.

## Steps

1. **Go to your Supabase project dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open the SQL Editor**
   - In the left sidebar, click on "SQL Editor"
   - Click "New query"

3. **Run the following SQL script:**

```sql
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
DROP POLICY IF EXISTS "Anyone can view game scores" ON game_scores;
CREATE POLICY "Anyone can view game scores" ON game_scores
  FOR SELECT USING (true);

-- Create policy for inserting scores (authenticated users can insert)
DROP POLICY IF EXISTS "Authenticated users can insert game scores" ON game_scores;
CREATE POLICY "Authenticated users can insert game scores" ON game_scores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

4. **Execute the script**
   - Click "Run" or press Ctrl+Enter
   - You should see "Success" message if everything works correctly

5. **Verify the table was created**
   - Go to "Table Editor" in the left sidebar
   - You should see the `game_scores` table listed

## After Setup
Once you've created the table, the error in your application should be resolved and the global scores should load properly.

## Note
If you don't have a `game_rooms` table yet, you'll need to create that first. The `game_scores` table references `game_rooms(id)` with a foreign key constraint.

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up database tables...');

  try {
    // Create game_scores table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (error) {
      console.error('Error creating table:', error);
      return;
    }

    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  }
}

setupDatabase();

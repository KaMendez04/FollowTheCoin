const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.error('You can get this from your Supabase project settings > API > service_role');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createGameScoresTable() {
  console.log('Creating game_scores table...');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20240420000002_create_game_scores.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute the SQL using raw SQL execution
    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('Table does not exist, creating it...');
      
      // Try to create the table using a different approach
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: sql
      });

      if (createError) {
        console.error('Error creating table with exec_sql:', createError);
        console.log('\nYou need to manually create the table in your Supabase dashboard:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Run the following SQL:');
        console.log('\n' + sql);
        return;
      }

      console.log('✅ Table created successfully!');
    } else if (error) {
      console.error('Error checking table:', error);
    } else {
      console.log('✅ Table already exists!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createGameScoresTable();

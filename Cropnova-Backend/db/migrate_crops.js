const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected. Running migration...');
    
    await client.query('ALTER TABLE crops ADD COLUMN IF NOT EXISTS acreage DECIMAL(10,2)');
    console.log('Added acreage column');
    
    await client.query('ALTER TABLE crops ADD COLUMN IF NOT EXISTS irrigation_source VARCHAR(50)');
    console.log('Added irrigation_source column');
    
    await client.query('ALTER TABLE crops ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2)');
    console.log('Added budget column');
    
    client.release();
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();

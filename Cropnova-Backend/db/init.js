const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const run = async () => {
  console.log('Connecting to database:', process.env.DATABASE_URL);
  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await dbClient.connect();
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('Executing schema.sql to create tables...');
    await dbClient.query(schema);

    console.log('Migrating & ensuring all user table columns exist...');
    await dbClient.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(120);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'farmer';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(100);
      
      ALTER TABLE farms ADD COLUMN IF NOT EXISTS ph_level VARCHAR(20) DEFAULT '6.8';
      ALTER TABLE farms ADD COLUMN IF NOT EXISTS organic_carbon VARCHAR(20) DEFAULT '0.55%';

      -- Remove NOT NULL constraints on legacy columns if they exist in pre-existing sakharam DB
      DO $$ 
      BEGIN 
        ALTER TABLE users ALTER COLUMN aadhaar_encrypted DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;

      DO $$ 
      BEGIN 
        ALTER TABLE users ALTER COLUMN photo_url DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;

      DO $$ 
      BEGIN 
        ALTER TABLE users ALTER COLUMN language_pref DROP NOT NULL;
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$;
    `);

    console.log('Schema executed successfully. All tables and columns ready!');
  } catch (err) {
    console.error('Error executing schema:', err.message);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
};

run();

#!/usr/bin/env node
/**
 * Setup script: apply Supabase SQL migration
 * Run locally: node setup-db.js
 */

const fs = require('fs');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:JO8ywOv7jPjnNzVo@db.utuqqraudgdzmyvdxipq.supabase.co:5432/postgres';

const sql = fs.readFileSync('./supabase/init_tables.sql', 'utf8');

async function setup() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected!');
    
    console.log('Running SQL migration...');
    await client.query(sql);
    console.log('✓ SQL migration applied successfully!');
    console.log('Tables created: users, workshops, registrations, attendance, feedback_forms, feedback_responses');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setup();

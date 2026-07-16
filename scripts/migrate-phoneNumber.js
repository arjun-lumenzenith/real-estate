#!/usr/bin/env node

/**
 * Migration Script: Add phoneNumber column to builders table
 * 
 * This script adds the phoneNumber column to the builders table if it doesn't exist.
 * It's safe to run multiple times - it checks if the column exists first.
 */

const { Pool } = require('pg');

async function migrate() {
  console.log('🔄 Starting migration: Add phoneNumber to builders table...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if the column already exists
    const checkResult = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'builders' AND column_name = 'phoneNumber'`
    );

    if (checkResult.rows.length > 0) {
      console.log('✓ phoneNumber column already exists in builders table');
      return;
    }

    // Add the phoneNumber column
    await pool.query(
      `ALTER TABLE "builders" ADD COLUMN "phoneNumber" varchar(20)`
    );

    console.log('✓ Successfully added phoneNumber column to builders table');

    // Show the updated table structure
    const tableInfo = await pool.query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_name = 'builders'
       ORDER BY ordinal_position`
    );

    console.log('\n📋 Updated builders table structure:');
    tableInfo.rows.forEach((row) => {
      console.log(`   • ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
    });

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

#!/usr/bin/env node
/**
 * Script to set DATABASE_URL from individual PostgreSQL env vars
 * This is needed for Prisma CLI commands that read directly from .env
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  console.error('.env file not found');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

// Extract values
const getEnvValue = (key) => {
  const line = envLines.find((l) => l.startsWith(`${key}=`));
  if (!line) return null;
  return line.split('=')[1]?.trim().replace(/^["']|["']$/g, '');
};

const host = getEnvValue('PGHOST') || 'localhost';
const port = getEnvValue('PGPORT') || '5432';
const user = getEnvValue('PGUSER') || 'postgres';
const password = getEnvValue('PGPASSWORD') || '';
const database = getEnvValue('PGDATABASE') || 'sporthub';

const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}`;

// Set in process.env for Prisma CLI and current process
process.env.DATABASE_URL = databaseUrl;

// Export for use in scripts
module.exports = { DATABASE_URL: databaseUrl };

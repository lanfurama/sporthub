#!/usr/bin/env node
/**
 * Wrapper script for Prisma CLI commands
 * Sets DATABASE_URL from individual PostgreSQL env vars before running Prisma
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../.env');

// Read .env and extract values
const getEnvValue = (key) => {
  if (!fs.existsSync(envPath)) return null;
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const line = envContent.split('\n').find((l) => l.startsWith(`${key}=`));
  if (!line) return null;
  return line.split('=')[1]?.trim().replace(/^["']|["']$/g, '');
};

const host = getEnvValue('PGHOST') || process.env.PGHOST || 'localhost';
const port = getEnvValue('PGPORT') || process.env.PGPORT || '5432';
const user = getEnvValue('PGUSER') || process.env.PGUSER || 'postgres';
const password = getEnvValue('PGPASSWORD') || process.env.PGPASSWORD || '';
const database = getEnvValue('PGDATABASE') || process.env.PGDATABASE || 'sporthub';

const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}`;

// Set DATABASE_URL in environment
process.env.DATABASE_URL = databaseUrl;

// Get Prisma command from args (everything after this script name)
const prismaArgs = process.argv.slice(2);

if (prismaArgs.length === 0) {
  console.error('Usage: node prisma-wrapper.js <prisma-command> [args...]');
  console.error('Example: node prisma-wrapper.js migrate dev');
  process.exit(1);
}

// Run Prisma CLI with the provided arguments
const prismaProcess = spawn('npx', ['prisma', ...prismaArgs], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl,
  },
});

prismaProcess.on('close', (code) => {
  process.exit(code || 0);
});

prismaProcess.on('error', (error) => {
  console.error('Failed to start Prisma:', error);
  process.exit(1);
});

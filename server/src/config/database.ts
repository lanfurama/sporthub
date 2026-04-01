import dotenv from 'dotenv';
dotenv.config();

/**
 * Build DATABASE_URL from individual PostgreSQL environment variables
 * This allows us to avoid hardcoding the connection string in .env
 */
export function getDatabaseUrl(): string {
  const host = process.env.PGHOST || 'localhost';
  const port = process.env.PGPORT || '5432';
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || '';
  const database = process.env.PGDATABASE || 'sporthub';

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

// Set DATABASE_URL for Prisma if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = getDatabaseUrl();
}

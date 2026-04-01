// Import database config first to set DATABASE_URL before Prisma initializes
import './config/database';

import { createServer } from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { initializeWebSocket } from './ws';
import { getDatabaseUrl } from './config/database';

/**
 * Check database connection and log connection details
 */
async function checkDatabaseConnection() {
  const dbUrl = getDatabaseUrl();
  const url = new URL(dbUrl);
  
  console.log('\n🔍 Checking database connection...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Host:     ${url.hostname}`);
  console.log(`🔌 Port:     ${url.port}`);
  console.log(`👤 User:     ${url.username}`);
  console.log(`🗄️  Database: ${url.pathname.slice(1)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Test connection with a simple query
    await prisma.$connect();
    
    // Verify connection with a query
    await prisma.$queryRaw`SELECT 1`;
    
    console.log('✅ Database connection successful!\n');
    logger.info('Database connected successfully', {
      host: url.hostname,
      port: url.port,
      database: url.pathname.slice(1),
    });
    
    return true;
  } catch (error: unknown) {
    console.error('❌ Database connection failed!\n');
    console.error('Error details:');
    const err = error as { message?: string; code?: string };
    console.error(`   ${err.message || error}\n`);
    
    if (err.code === 'ECONNREFUSED') {
      console.error('💡 Possible issues:');
      console.error('   • PostgreSQL server is not running');
      console.error('   • Wrong host or port in .env');
      console.error('   • Firewall blocking connection\n');
    } else if (err.code === 'P1000' || err.message?.includes('authentication')) {
      console.error('💡 Possible issues:');
      console.error('   • Wrong username or password in .env');
      console.error('   • User does not have permission to access database\n');
    } else if (err.code === 'P1001' || err.message?.includes('database')) {
      console.error('💡 Possible issues:');
      console.error('   • Database does not exist');
      console.error('   • Run: npm run db:migrate to create database\n');
    }
    
    logger.error('Database connection failed', { error });
    return false;
  }
}

async function bootstrap() {
  try {
    // Check database connection first
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection.\n');
      process.exit(1);
    }

    const server = createServer(app);
    initializeWebSocket(server);
    logger.info('WebSocket server initialized');

    server.listen(env.PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 Server started successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🌐 Server:   http://localhost:${env.PORT}`);
      console.log(`📡 API:      http://localhost:${env.PORT}/api`);
      console.log(`🔌 WebSocket: ws://localhost:${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      logger.info(`Server running on http://localhost:${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server\n');
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap();

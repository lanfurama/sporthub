import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const method = req.method;
  const url = req.url;
  const fullUrl = req.originalUrl || url;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  const userId = req.user?.id || 'anonymous';

  // Log incoming request
  const timestamp = new Date().toISOString();
  console.log(`\n📥 [${timestamp}] ${method} ${fullUrl}`);
  console.log(`   IP: ${ip}`);
  console.log(`   User-Agent: ${userAgent}`);
  console.log(`   User: ${userId}`);
  if (Object.keys(req.query).length > 0) {
    console.log(`   Query:`, JSON.stringify(req.query, null, 2));
  }
  if (Object.keys(req.body).length > 0) {
    console.log(`   Body:`, JSON.stringify(req.body, null, 2));
  }

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusEmoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : '✅';

    console.log(`📤 [${new Date().toISOString()}] ${statusEmoji} ${method} ${fullUrl} - ${statusCode} - ${duration}ms`);

    logger.info('Request completed', {
      method,
      url: fullUrl,
      statusCode,
      duration,
      ip,
      userAgent,
      userId,
    });

    if (statusCode >= 400) {
      console.error(`   ⚠️ Error Response Details:`);
      console.error(`   Status: ${statusCode}`);
    }
  });

  // Log errors
  res.on('error', (err) => {
    console.error(`\n❌ [${new Date().toISOString()}] Response Error`);
    console.error(`   Method: ${method} ${fullUrl}`);
    console.error(`   Error:`, err);
    console.error('');
  });

  next();
}

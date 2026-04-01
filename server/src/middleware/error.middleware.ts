import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.get('user-agent') || 'unknown';

  if (err instanceof ZodError) {
    const errorDetails = err.flatten().fieldErrors;
    console.error(`\n❌ [${timestamp}] API Error - Validation Failed`);
    console.error(`   Method: ${method} ${url}`);
    console.error(`   IP: ${ip}`);
    console.error(`   User-Agent: ${userAgent}`);
    console.error(`   Error: VALIDATION_ERROR - Dữ liệu không hợp lệ`);
    console.error(`   Details:`, JSON.stringify(errorDetails, null, 2));
    console.error('');

    logger.error('Validation error', {
      method,
      url,
      ip,
      userAgent,
      error: errorDetails,
    });

    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details: errorDetails,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    console.error(`\n❌ [${timestamp}] API Error`);
    console.error(`   Method: ${method} ${url}`);
    console.error(`   IP: ${ip}`);
    console.error(`   User-Agent: ${userAgent}`);
    console.error(`   Status: ${err.statusCode}`);
    console.error(`   Code: ${err.code}`);
    console.error(`   Message: ${err.message}`);
    console.error('');

    logger.error('API error', {
      method,
      url,
      ip,
      userAgent,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
    });

    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;

  console.error(`\n❌ [${timestamp}] Unhandled Error`);
  console.error(`   Method: ${method} ${url}`);
  console.error(`   IP: ${ip}`);
  console.error(`   User-Agent: ${userAgent}`);
  console.error(`   Error: ${errorMessage}`);
  if (errorStack) {
    console.error(`   Stack:\n${errorStack}`);
  }
  console.error('');

  logger.error('Unhandled error', {
    method,
    url,
    ip,
    userAgent,
    error: err,
    stack: errorStack,
  });

  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

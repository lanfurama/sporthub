import './types/express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { router } from './routes';

export const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (after body parsing, before routes)
app.use(requestLogger);

// Rate limiting — 100 req/min per IP on public endpoints
app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
  }),
);


// Routes - support both /api/v1 and /api for backward compatibility
app.use('/api/v1', router);
app.use('/api', router);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler for unmatched routes
app.use((req, res, next) => {
  console.error(`\n❌ [404] Route not found: ${req.method} ${req.originalUrl || req.url}`);
  console.error(`   Available routes:`);
  console.error(`   - GET /api/v1/courts`);
  console.error(`   - GET /api/courts`);
  console.error(`   - GET /health`);
  console.error('');
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl || req.url} not found`,
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

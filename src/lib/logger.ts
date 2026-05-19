// Console-wrapper logger. Replaces winston-based logger from the Express server.
// Winston isn't installed in this Next.js project, and the Edge runtime is Web-API only
// (no Node streams/fs), so a console wrapper works in every runtime.
export const logger = {
  info: (...args: unknown[]) => console.log('[INFO]', ...args),
  warn: (...args: unknown[]) => console.warn('[WARN]', ...args),
  error: (...args: unknown[]) => console.error('[ERROR]', ...args),
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEBUG]', ...args);
    }
  },
};

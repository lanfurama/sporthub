import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all routes except: api, _next, _vercel, static files, admin (admin stays English-only)
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
  ],
};

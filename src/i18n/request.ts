import { getRequestConfig } from 'next-intl/server';

// Minimal stub — Task 3 replaces this with the real per-locale config.
// Required by the next-intl plugin in next.config.mjs so the dev server can start.
export default getRequestConfig(async () => {
  return {
    locale: 'en',
    messages: {},
  };
});

import { getRequestConfig } from 'next-intl/server';
import { routing, type SupportedLang } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: SupportedLang =
    requested && (routing.locales as readonly string[]).includes(requested)
      ? (requested as SupportedLang)
      : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

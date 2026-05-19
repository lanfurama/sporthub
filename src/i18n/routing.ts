import { defineRouting } from 'next-intl/routing';

export const SUPPORTED_LANGS = ['en', 'ko', 'ja', 'vi', 'ru'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const LANG_LABELS: Record<SupportedLang, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  vi: 'Tiếng Việt',
  ru: 'Русский',
};

export const LANG_FLAGS: Record<SupportedLang, string> = {
  en: '🇺🇸',
  ko: '🇰🇷',
  ja: '🇯🇵',
  vi: '🇻🇳',
  ru: '🇷🇺',
};

export const routing = defineRouting({
  locales: SUPPORTED_LANGS,
  defaultLocale: 'en',
  localePrefix: 'always',
});

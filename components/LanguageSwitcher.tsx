'use client';

import { useState } from 'react';
import { useRouter, usePathname } from '@/src/i18n/navigation';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CaretDown, Globe } from '@phosphor-icons/react';
import { SUPPORTED_LANGS, LANG_LABELS, LANG_FLAGS, type SupportedLang } from '@/src/i18n/routing';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ lang: string }>();
  const currentLang = (params?.lang ?? 'en') as SupportedLang;
  const [open, setOpen] = useState(false);

  const handleSelect = (lang: SupportedLang) => {
    setOpen(false);
    router.replace(pathname, { locale: lang });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all"
        aria-label="Change language"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Globe size={16} className="text-ink-muted" />
        <span className="text-xs font-bold text-ink uppercase tracking-wider">{currentLang}</span>
        <CaretDown size={14} className={`text-ink-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              className="absolute right-0 top-full mt-2 z-50 min-w-[180px] bg-surface border border-border rounded-xl shadow-sport overflow-hidden"
            >
              {SUPPORTED_LANGS.map((lang) => {
                const isActive = lang === currentLang;
                return (
                  <li key={lang} role="option" aria-selected={isActive}>
                    <button
                      onClick={() => handleSelect(lang)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors ${
                        isActive ? 'bg-primary/5 text-primary font-bold' : 'text-ink hover:bg-surface-muted'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span aria-hidden>{LANG_FLAGS[lang]}</span>
                        <span>{LANG_LABELS[lang]}</span>
                      </span>
                      {isActive && <Check size={14} />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

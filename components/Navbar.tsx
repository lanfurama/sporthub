'use client';

import { useRouter, useParams } from 'next/navigation';
import NextLink from 'next/link';
import { Link } from '@/src/i18n/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SignOut, SquaresFour, Pulse } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/src/lib/auth-store';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? 'en';
  const t = useTranslations();
  const { scrollY } = useScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.92)'],
  );

  const boxShadow = useTransform(
    scrollY,
    [0, 50],
    ['0 0 0 0 rgba(0,0,0,0)', '0 4px 16px -2px rgba(15, 23, 42, 0.08)'],
  );

  const handleLogout = () => {
    logout();
    router.push(`/${lang}/login`);
  };

  return (
    <motion.nav
      style={{ backgroundColor, boxShadow, backdropFilter: 'blur(12px)' }}
      className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center px-4 md:px-6 border-b border-border/60"
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="SportHub home">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-sport"
          >
            <Pulse className="w-5 h-5 text-primary-foreground" weight="bold" />
          </motion.div>
          <span className="text-xl font-display font-bold text-ink tracking-tight">
            Sport<span className="text-primary">Hub</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <Link href="/" className="text-ink-muted hover:text-ink text-sm font-semibold transition-colors">
            {t('nav.home')}
          </Link>
          <Link href="/book" className="text-ink-muted hover:text-ink text-sm font-semibold transition-colors">
            {t('nav.bookNow')}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-ink leading-none">{user.name}</span>
                <span className="text-[10px] text-primary uppercase tracking-[0.15em] font-bold mt-1">
                  {user.role}
                </span>
              </div>

              {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'staff') && (
                <NextLink
                  href="/admin/dashboard"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-surface border border-border text-ink-muted hover:text-primary hover:border-primary/40 transition-all"
                  aria-label={t('nav.dashboard')}
                  title={t('nav.dashboard')}
                >
                  <SquaresFour size={18} />
                </NextLink>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-surface border border-border text-ink-muted hover:text-accent hover:border-accent/40 transition-all"
                aria-label={t('nav.logout')}
                title={t('nav.logout')}
              >
                <SignOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary text-sm px-4 py-2">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

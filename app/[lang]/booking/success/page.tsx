'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/src/i18n/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, House, CalendarBlank, Info } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';

function BookingSuccessInner() {
  const searchParams = useSearchParams();
  const t = useTranslations();
  const ref = searchParams.get('ref') ?? 'N/A';

  return (
    <div className="min-h-[100dvh]">
      <Navbar />

      <main className="pt-20 flex items-center justify-center min-h-[100dvh] px-4 md:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 16 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary text-primary-foreground shadow-sport-lg mb-6"
          >
            <CheckCircle size={40} weight="bold" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-ink mb-3 tracking-tightest">
            {t('bookingSuccess.title')}{' '}
            <span className="text-primary">{t('bookingSuccess.titleHighlight')}</span>
          </h1>

          <p className="text-ink-muted mb-8">{t('bookingSuccess.message')}</p>

          <div className="sport-card p-6 mb-6 text-left">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl" aria-hidden />
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
              {t('bookingSuccess.bookingRef')}
            </p>
            <p className="text-3xl md:text-4xl font-display font-bold text-primary tracking-widest tabular-nums break-all">
              {ref}
            </p>
            <p className="text-xs text-ink-subtle mt-3 font-medium">
              {t('bookingSuccess.saveRef')}
            </p>
          </div>

          <div className="sport-card p-5 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                <Info size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-ink mb-2.5">
                  {t('bookingSuccess.guidelinesTitle')}
                </p>
                <ul className="text-sm text-ink-muted space-y-2">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span>{t(`bookingSuccess.guideline${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book" className="btn-secondary flex-1">
              <CalendarBlank size={18} />
              {t('bookingSuccess.bookAnother')}
            </Link>
            <Link href="/" className="btn-primary flex-1">
              <House size={18} />
              {t('bookingSuccess.goHome')}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function BookingSuccessFallback() {
  return (
    <div className="min-h-[100dvh]">
      <Navbar />
      <main className="pt-20 flex items-center justify-center min-h-[100dvh] px-4 md:px-6 py-16">
        <div className="max-w-md w-full text-center text-ink-muted text-sm">…</div>
      </main>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<BookingSuccessFallback />}>
      <BookingSuccessInner />
    </Suspense>
  );
}

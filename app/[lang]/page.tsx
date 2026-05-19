'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  Clock,
  Hourglass,
  Trophy,
  Target,
  Zap,
  Activity,
  MapPin,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Spinner from '@/components/Spinner';
import { courtsApi } from '@/src/lib/api/courts';
import type { Court } from '@/src/types';

const SPORTS = [
  {
    id: 'Tennis',
    label: 'Tennis',
    icon: Trophy,
    tint: 'bg-info/10 text-info border-info/30',
    activeTint: 'bg-info text-white border-info',
  },
  {
    id: 'Pickleball',
    label: 'Pickleball',
    icon: Target,
    tint: 'bg-accent/10 text-accent border-accent/30',
    activeTint: 'bg-accent text-white border-accent',
  },
  {
    id: 'Badminton',
    label: 'Badminton',
    icon: Zap,
    tint: 'bg-primary/10 text-primary border-primary/30',
    activeTint: 'bg-primary text-primary-foreground border-primary',
  },
];

const DURATIONS = [1, 1.5, 2, 2.5, 3];

const LOCALE_BY_LANG: Record<string, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  ja: 'ja-JP',
  vi: 'vi-VN',
  ru: 'ru-RU',
};

function formatPrice(price: number, lang: string) {
  return new Intl.NumberFormat(LOCALE_BY_LANG[lang] ?? 'en-US').format(price);
}

function CourtCard({
  court,
  onBook,
  index,
  t,
  lang,
}: {
  court: Court;
  onBook: () => void;
  index: number;
  t: ReturnType<typeof useTranslations>;
  lang: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4) }}
      className="sport-card sport-card-hover p-6 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <span className="section-eyebrow">{court.sport}</span>
          <h3 className="mt-1 text-xl font-display font-bold text-ink group-hover:text-primary-hover transition-colors truncate">
            {court.name}
          </h3>
        </div>
        <span
          className={`chip ${
            court.status === 'active'
              ? 'bg-status-success-bg text-status-success-text border-status-success-border'
              : 'bg-status-danger-bg text-status-danger-text border-status-danger-border'
          }`}
        >
          {court.status === 'active' ? t('home.courtStatus.active') : court.status}
        </span>
      </div>

      {court.description && (
        <p className="text-sm text-ink-muted mb-5 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {court.description}
        </p>
      )}

      <div className="bg-surface-muted rounded-xl p-4 mb-5 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-ink-muted font-medium">{t('home.priceNormal')}</span>
          <span className="text-sm text-ink font-bold tabular-nums">
            {formatPrice(court.priceNormal, lang)}{' '}
            <span className="text-[10px] font-normal text-ink-subtle">{t('home.perHour')}</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-accent" strokeWidth={2.5} />
            <span className="text-xs text-accent font-bold uppercase tracking-tight">
              {t('home.pricePeak')}
            </span>
          </div>
          <span className="text-sm text-accent font-bold tabular-nums">
            {formatPrice(court.pricePeak, lang)}{' '}
            <span className="text-[10px] font-normal text-ink-subtle">{t('home.perHour')}</span>
          </span>
        </div>
        <div className="pt-2 border-t border-border flex justify-between items-center">
          <span className="text-[10px] text-ink-subtle uppercase font-bold tracking-wider">
            {t('home.peakHours')}
          </span>
          <span className="text-[11px] text-ink-muted tabular-nums">
            {court.peakStart} – {court.peakEnd}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onBook}
        disabled={court.status !== 'active'}
        className="btn-primary w-full"
      >
        {t('home.bookNow')}
      </button>
    </motion.article>
  );
}

export default function HomePage() {
  const t = useTranslations();
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? 'en';
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [selectedSport, setSelectedSport] = useState('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  const [searched, setSearched] = useState(false);

  const { data: allCourts } = useQuery({
    queryKey: ['courts', 'all'],
    queryFn: () => courtsApi.list(),
    staleTime: 60_000,
  });

  const { data: courts, isFetching, isError } = useQuery({
    queryKey: ['courts', selectedSport, date, time, duration, searched],
    queryFn: () =>
      courtsApi.list({
        ...(selectedSport ? { sport: selectedSport } : {}),
        date,
        time,
        duration,
      }),
    enabled: searched,
  });

  const handleSearch = () => setSearched(true);

  const handleBook = (court: Court) => {
    const params = new URLSearchParams({
      courtId: String(court.id),
      date,
      time,
      duration: String(duration),
    });
    router.push(`/${lang}/book?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main id="main" className="pt-16 md:pt-20">
        {/* Hero */}
        <section className="relative px-4 md:px-6 pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
          {/* Soft court-pattern background */}
          <div
            aria-hidden
            className="absolute inset-0 bg-court-pattern opacity-60 pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-32 bg-hero-fade pointer-events-none"
          />

          <div className="max-w-6xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-subtle border border-primary/20 text-primary text-xs font-bold tracking-wide mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {t('home.heroBadge')}
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-ink mb-5 leading-[1.05] tracking-tightest">
              {t('home.heroTitle')}{' '}
              <span className="text-primary">{t('home.heroTitleHighlight')}</span>
            </h1>

            <p className="text-ink-muted text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('home.heroDescription')}
            </p>

            {/* Sport selectors */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {SPORTS.map((sport) => {
                const Icon = sport.icon;
                const courtCount = allCourts?.filter((c) => c.sport === sport.id).length || 0;
                const isActive = selectedSport === sport.id;

                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setSelectedSport(isActive ? '' : sport.id)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200 min-h-[56px] ${
                      isActive
                        ? `${sport.activeTint} shadow-sport`
                        : `bg-surface ${sport.tint} hover:bg-surface-muted`
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.25} />
                    <div className="text-left">
                      <div className="text-sm font-bold">{sport.label}</div>
                      <div className="text-[10px] font-semibold opacity-80">
                        {courtCount} {t('home.courtsAvailable')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto bg-surface border border-border rounded-2xl shadow-sport-lg p-2 md:p-2.5"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <div className="md:col-span-3 relative">
                  <Calendar
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                    size={18}
                  />
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    aria-label={t('home.date')}
                    className="w-full bg-surface-muted border border-transparent rounded-xl pl-11 pr-3 py-3.5 text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                  />
                </div>

                <div className="md:col-span-3 relative">
                  <Clock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                    size={18}
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    aria-label={t('home.time')}
                    className="w-full bg-surface-muted border border-transparent rounded-xl pl-11 pr-3 py-3.5 text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors"
                  />
                </div>

                <div className="md:col-span-3 relative">
                  <Hourglass
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                    size={18}
                  />
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    aria-label={t('home.duration')}
                    className="w-full bg-surface-muted border border-transparent rounded-xl pl-11 pr-3 py-3.5 text-sm text-ink focus:outline-none focus:border-primary focus:bg-surface transition-colors appearance-none cursor-pointer"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} {t('home.hoursPlay')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="btn-primary w-full h-full"
                  >
                    <Search size={18} />
                    <span className="font-bold">{t('home.searchButton')}</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Trust strip */}
            <div className="mt-10 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-ink-muted">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck size={16} className="text-primary" />
                <span className="font-medium">{t('home.trustVerified')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={16} className="text-info" />
                <span className="font-medium">{t('home.trustInstant')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-accent" />
                <span className="font-medium">{t('home.trustNearby')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
          {!searched ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary-subtle rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary/20">
                <Search className="text-primary" size={28} strokeWidth={2.25} />
              </div>
              <h2 className="text-2xl font-display font-bold text-ink mb-2">
                {t('home.readyTitle')}
              </h2>
              <p className="text-ink-muted">{t('home.readySubtitle')}</p>
            </div>
          ) : isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-primary">
              <Spinner size={40} />
              <p className="text-ink-muted font-semibold mt-5">{t('home.searching')}</p>
            </div>
          ) : isError ? (
            <div className="text-center py-16 max-w-md mx-auto sport-card bg-status-danger-bg border-status-danger-border">
              <Zap size={32} className="mx-auto mb-3 text-status-danger-text" />
              <p className="font-semibold text-status-danger-text">{t('home.errorMessage')}</p>
            </div>
          ) : !courts || courts.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto sport-card">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-surface-muted flex items-center justify-center">
                <Activity className="text-ink-subtle" size={28} />
              </div>
              <h3 className="text-xl font-display font-bold text-ink mb-2">
                {t('home.noResultsTitle')}
              </h3>
              <p className="text-ink-muted text-sm">{t('home.noResultsMessage')}</p>
              <button
                type="button"
                onClick={() => setSearched(false)}
                className="mt-6 text-primary font-bold text-sm hover:underline"
              >
                {t('home.backToSearch')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">
                    {t('home.resultsTitle')}{' '}
                    <span className="text-primary">{t('home.resultsHighlight')}</span>
                  </h2>
                  <p className="text-ink-muted text-sm mt-1">
                    {t('home.courtsFound', { count: courts.length })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="chip bg-surface-muted text-ink-muted border-border">
                    <Calendar size={12} /> {date}
                  </span>
                  <span className="chip bg-primary-subtle text-primary border-primary/30">
                    <Clock size={12} /> {time}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courts.map((court, i) => (
                  <CourtCard
                    key={court.id}
                    court={court}
                    onBook={() => handleBook(court)}
                    index={i}
                    t={t}
                    lang={lang}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-sport">
              <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-display font-bold text-ink tracking-tight">
              Sport<span className="text-primary">Hub</span>
            </span>
          </div>
          <p className="text-ink-muted text-sm max-w-md mx-auto">
            {t('home.footerDescription')}
          </p>
          <div className="mt-6 flex justify-center gap-6">
            {['Facebook', 'Instagram', 'TikTok'].map((social) => (
              <button
                key={social}
                type="button"
                className="text-xs font-bold text-ink-muted hover:text-primary transition-colors"
              >
                {social}
              </button>
            ))}
          </div>
          <p className="mt-8 text-[11px] text-ink-subtle">{t('home.footerCopyright')}</p>
        </div>
      </footer>
    </div>
  );
}

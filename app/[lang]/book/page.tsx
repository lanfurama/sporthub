'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarBlank,
  Clock,
  User,
  CheckCircle,
  CaretRight,
  CaretLeft,
  CreditCard,
  WarningCircle,
} from '@phosphor-icons/react';
import Navbar from '@/components/Navbar';
import Spinner from '@/components/Spinner';
import MemberSearch from '@/components/MemberSearch';
import PriceBreakdown from '@/components/PriceBreakdown';
import { courtsApi } from '@/src/lib/api/courts';
import { bookingsApi } from '@/src/lib/api/bookings';
import { useAuthStore } from '@/src/lib/auth-store';
import type { Court, Member } from '@/src/types';

const STEP_KEYS = ['booking.steps.courtInfo', 'booking.steps.yourInfo', 'booking.steps.confirm'];

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

function StepIndicator({
  current,
  t,
}: {
  current: number;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center justify-between max-w-md mx-auto mb-14 relative">
      <div className="absolute top-5 left-5 right-5 h-1 bg-border rounded-full" aria-hidden />
      <motion.div
        className="absolute top-5 left-5 h-1 bg-primary rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: `calc(${(current / (STEP_KEYS.length - 1)) * 100}% - ${current === 0 ? '0px' : '0px'})` }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        aria-hidden
      />
      {STEP_KEYS.map((key, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'future';
        const isDoneOrActive = state === 'done' || state === 'active';
        return (
          <div key={key} className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{
                scale: state === 'active' ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors shadow-sport ${
                isDoneOrActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface border border-border text-ink-subtle'
              }`}
            >
              {state === 'done' ? <CheckCircle size={18} /> : i + 1}
            </motion.div>
            <span
              className={`absolute top-12 whitespace-nowrap text-xs font-semibold ${
                state === 'active' ? 'text-primary' : 'text-ink-muted'
              }`}
            >
              {t(key)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  useMembership: boolean;
  memberId: string;
  useCredit: boolean;
  creditAmount: number;
  useGuestPass: boolean;
  note: string;
}

function isPeakTime(startTime: string, peakStart: string, peakEnd: string): boolean {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const start = toMin(startTime);
  const ps = toMin(peakStart);
  const pe = toMin(peakEnd);
  return start >= ps && start < pe;
}

function BookingFlowInner() {
  const t = useTranslations();
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? 'en';
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const courtIdParam = searchParams.get('courtId');
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const [courtId] = useState<number>(courtIdParam ? Number(courtIdParam) : 0);
  const [date, setDate] = useState(searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(searchParams.get('time') ?? '09:00');
  const [duration, setDuration] = useState(Number(searchParams.get('duration') ?? 1));

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    useMembership: false,
    memberId: '',
    useCredit: false,
    creditAmount: 0,
    useGuestPass: false,
    note: '',
  });
  const [linkedMember, setLinkedMember] = useState<Member | null>(null);

  useEffect(() => {
    if (!user) return;
    setCustomer((prev) => ({
      ...prev,
      name: user.name,
      phone: user.phone ?? prev.phone,
      email: user.email ?? prev.email,
    }));
  }, [user]);

  const { data: court, isLoading: courtLoading } = useQuery<Court>({
    queryKey: ['court', courtId],
    queryFn: () => courtsApi.getById(courtId),
    enabled: courtId > 0,
  });

  const { data: availability } = useQuery({
    queryKey: ['availability', courtId, date],
    queryFn: () => courtsApi.getAvailability(courtId, date),
    enabled: courtId > 0 && !!date,
    refetchInterval: 5000,
  });

  const isPeak = court ? isPeakTime(time, court.peakStart, court.peakEnd) : false;
  const hourlyRate = court ? (isPeak ? court.pricePeak : court.priceNormal) : 0;
  const basePrice = hourlyRate * duration;

  const membershipDiscount = linkedMember?.memberships?.[0]
    ? Math.floor(
        (basePrice *
          (linkedMember.memberships[0].plan === 'vip'
            ? 35
            : linkedMember.memberships[0].plan === 'prime'
            ? 20
            : 10)) /
          100
      )
    : 0;

  const creditUsed =
    customer.useCredit && linkedMember?.memberships?.[0]
      ? Math.min(customer.creditAmount, basePrice - membershipDiscount)
      : 0;
  const finalPrice = Math.max(0, basePrice - membershipDiscount - creditUsed);

  const nextStep = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        courtId,
        date,
        time,
        duration,
        customer: {
          name: customer.name,
          phone: customer.phone,
          ...(customer.email ? { email: customer.email } : {}),
        },
        ...(linkedMember ? { memberId: linkedMember.id } : {}),
        ...(customer.useCredit
          ? { useCredit: true, creditAmount: customer.creditAmount }
          : {}),
        ...(customer.useGuestPass ? { useGuestPass: true } : {}),
        ...(customer.note ? { note: customer.note } : {}),
      };
      const res = (await bookingsApi.create(payload)) as unknown as {
        data?: { ref?: string };
        ref?: string;
      };
      const ref = res?.data?.ref ?? res?.ref ?? 'N/A';
      router.push(`/${lang}/booking/success?ref=${ref}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
        t('booking.bookingFailed');
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 40 : -40, opacity: 0 }),
  };

  return (
    <div className="min-h-[100dvh]">
      <Navbar />

      <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-ink mb-2">
              {t('booking.title')}{' '}
              <span className="text-primary">{t('booking.titleHighlight')}</span>
            </h1>
            <p className="text-ink-muted text-sm">{t('booking.subtitle')}</p>
          </div>

          <StepIndicator current={step} t={t} />

          <div className="relative mt-16">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {/* Step 0: Court & Schedule */}
                {step === 0 && (
                  <div className="sport-card p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center text-primary">
                        <CalendarBlank size={20} />
                      </div>
                      <h2 className="text-lg md:text-xl font-display font-bold text-ink">
                        {t('booking.courtSchedule')}
                      </h2>
                    </div>

                    {courtLoading && (
                      <div className="flex justify-center py-12 text-primary">
                        <Spinner size={36} />
                      </div>
                    )}

                    {court && (
                      <div className="bg-surface-muted rounded-2xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-xl shadow-sport">
                            {court.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-ink text-lg">
                              {court.name}
                            </h3>
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">
                              {court.sport}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end gap-1 text-sm">
                          <p className="font-bold text-ink tabular-nums">
                            {formatPrice(court.priceNormal, lang)}{' '}
                            <span className="text-xs text-ink-muted font-normal">
                              VND/{t('home.perHour')} ({t('booking.normalPrice')})
                            </span>
                          </p>
                          <p className="font-bold text-accent tabular-nums">
                            {formatPrice(court.pricePeak, lang)}{' '}
                            <span className="text-xs text-ink-muted font-normal">
                              VND/{t('home.perHour')} (Peak {court.peakStart}–{court.peakEnd})
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="bf-date" className="text-xs font-bold text-ink-muted">
                          {t('booking.date')}
                        </label>
                        <div className="relative">
                          <CalendarBlank
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
                            size={16}
                          />
                          <input
                            id="bf-date"
                            type="date"
                            value={date}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            onChange={(e) => setDate(e.target.value)}
                            className="input-field pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="bf-time" className="text-xs font-bold text-ink-muted">
                          {t('booking.startTime')}
                        </label>
                        <div className="relative">
                          <Clock
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
                            size={16}
                          />
                          <input
                            id="bf-time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="input-field pl-10"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2.5">
                        <label className="text-xs font-bold text-ink-muted">
                          {t('booking.suggestedSlots')}
                        </label>
                        {availability && (
                          <div className="flex flex-wrap gap-2">
                            {availability.slots.map((slot) => {
                              const active = time === slot.time;
                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  onClick={() => slot.available && setTime(slot.time)}
                                  disabled={!slot.available}
                                  aria-pressed={active}
                                  className={`h-11 px-3.5 min-w-[68px] rounded-xl text-sm font-semibold border transition-colors tabular-nums ${
                                    active
                                      ? 'bg-primary text-primary-foreground border-primary shadow-sport'
                                      : slot.available
                                      ? 'bg-surface border-border text-ink hover:border-primary/50 hover:bg-primary/5'
                                      : 'bg-surface-muted border-border text-ink-subtle opacity-50 cursor-not-allowed line-through'
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-2.5">
                        <label className="text-xs font-bold text-ink-muted">
                          {t('booking.duration')}
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 1.5, 2, 2.5, 3].map((d) => {
                            const active = duration === d;
                            return (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setDuration(d)}
                                aria-pressed={active}
                                className={`h-11 rounded-xl text-sm font-bold transition-colors border ${
                                  active
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sport'
                                    : 'bg-surface border-border text-ink hover:border-primary/40'
                                }`}
                              >
                                {d}h
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!court || !date || !time}
                        className="btn-primary"
                      >
                        {t('booking.continue')}
                        <CaretRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 1: Your Info */}
                {step === 1 && (
                  <div className="sport-card p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center text-primary">
                        <User size={20} />
                      </div>
                      <h2 className="text-lg md:text-xl font-display font-bold text-ink">
                        {t('booking.customerInfo')}
                      </h2>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label htmlFor="bf-name" className="text-xs font-bold text-ink-muted">
                            {t('booking.fullName')}
                          </label>
                          <input
                            id="bf-name"
                            type="text"
                            value={customer.name}
                            onChange={(e) =>
                              setCustomer((p) => ({ ...p, name: e.target.value }))
                            }
                            placeholder={t('auth.namePlaceholder')}
                            disabled={!!user}
                            className={`input-field ${
                              user ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="bf-phone" className="text-xs font-bold text-ink-muted">
                            {t('booking.phoneNumber')}
                          </label>
                          <input
                            id="bf-phone"
                            type="tel"
                            value={customer.phone}
                            onChange={(e) =>
                              setCustomer((p) => ({ ...p, phone: e.target.value }))
                            }
                            placeholder="09xx xxx xxx"
                            disabled={!!user}
                            className={`input-field ${
                              user ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="bf-email" className="text-xs font-bold text-ink-muted">
                          {t('booking.emailOptional')}
                        </label>
                        <input
                          id="bf-email"
                          type="email"
                          value={customer.email}
                          onChange={(e) =>
                            setCustomer((p) => ({ ...p, email: e.target.value }))
                          }
                          placeholder="example@gmail.com"
                          disabled={!!user}
                          className={`input-field ${
                            user ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>

                      {!user && (
                        <div className="bg-primary-subtle border border-primary/30 rounded-2xl p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                              <CreditCard size={16} />
                            </div>
                            <span className="text-sm font-bold text-ink">
                              {t('booking.memberBenefits')}
                            </span>
                          </div>

                          <MemberSearch
                            onSelect={(member) => {
                              setLinkedMember(member);
                              if (member) {
                                setCustomer((p) => ({
                                  ...p,
                                  useMembership: true,
                                  memberId: member.id,
                                  useCredit: false,
                                  creditAmount: 0,
                                }));
                              } else {
                                setCustomer((p) => ({
                                  ...p,
                                  useMembership: false,
                                  memberId: '',
                                  useCredit: false,
                                  creditAmount: 0,
                                }));
                              }
                            }}
                            selectedMember={linkedMember}
                            placeholder={t('booking.memberSearchPlaceholder')}
                          />

                          {linkedMember?.memberships?.[0] && (
                            <div className="mt-4 bg-surface rounded-xl p-4 border border-border">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-ink">
                                  {linkedMember.name}
                                </span>
                                <span className="chip bg-primary text-primary-foreground border-primary">
                                  {linkedMember.memberships[0].plan.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-xs text-ink-muted">
                                {t('booking.discount')}:{' '}
                                <span className="text-primary font-bold">
                                  {linkedMember.memberships[0].plan === 'vip'
                                    ? 35
                                    : linkedMember.memberships[0].plan === 'prime'
                                    ? 20
                                    : 10}
                                  %
                                </span>{' '}
                                · {t('booking.credit')}:{' '}
                                <span className="text-primary font-bold tabular-nums">
                                  {formatPrice(linkedMember.memberships[0].creditBalance, lang)}{' '}
                                  VND
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label htmlFor="bf-note" className="text-xs font-bold text-ink-muted">
                          {t('booking.additionalNotes')}
                        </label>
                        <textarea
                          id="bf-note"
                          value={customer.note}
                          onChange={(e) =>
                            setCustomer((p) => ({ ...p, note: e.target.value }))
                          }
                          rows={3}
                          placeholder={t('booking.notesPlaceholder')}
                          className="input-field resize-none"
                        />
                      </div>

                      {court && (
                        <div className="pt-2">
                          <PriceBreakdown
                            basePrice={basePrice}
                            discountAmount={membershipDiscount}
                            creditUsed={creditUsed}
                            finalPrice={finalPrice}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row justify-between gap-3">
                      <button type="button" onClick={prevStep} className="btn-secondary">
                        <CaretLeft size={18} />
                        {t('booking.back')}
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!customer.name || (!user && !customer.phone)}
                        className="btn-primary"
                      >
                        {t('booking.review')}
                        <CaretRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Review */}
                {step === 2 && court && (
                  <div className="sport-card p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center text-primary">
                        <CheckCircle size={20} />
                      </div>
                      <h2 className="text-lg md:text-xl font-display font-bold text-ink">
                        {t('booking.confirmTitle')}
                      </h2>
                    </div>

                    {apiError && (
                      <div
                        role="alert"
                        className="mb-5 flex items-start gap-2 px-3.5 py-3 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger-text text-sm"
                      >
                        <WarningCircle size={16} className="mt-0.5 shrink-0" />
                        <span className="font-medium">{apiError}</span>
                      </div>
                    )}

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface-muted rounded-2xl p-5 space-y-3">
                          <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider border-b border-border pb-2.5">
                            {t('booking.courtDetails')}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-ink-muted">{t('booking.court')}</span>
                              <span className="font-semibold text-ink">{court.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ink-muted">{t('booking.time')}</span>
                              <span className="font-semibold text-ink tabular-nums">
                                {time} ({duration}h)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ink-muted">{t('booking.dateLabel')}</span>
                              <span className="font-semibold text-ink tabular-nums">{date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ink-muted">{t('booking.timeType')}</span>
                              <span
                                className={`font-bold ${
                                  isPeak ? 'text-accent' : 'text-primary'
                                }`}
                              >
                                {isPeak ? t('booking.peakTime') : t('booking.normalTime')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-surface-muted rounded-2xl p-5 space-y-3">
                          <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider border-b border-border pb-2.5">
                            {t('booking.bookerInfo')}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between gap-3">
                              <span className="text-ink-muted shrink-0">
                                {t('booking.nameLabel')}
                              </span>
                              <span className="font-semibold text-ink truncate">
                                {customer.name}
                              </span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-ink-muted shrink-0">
                                {t('booking.phoneLabel')}
                              </span>
                              <span className="font-semibold text-ink truncate">
                                {customer.phone}
                              </span>
                            </div>
                            {customer.email && (
                              <div className="flex justify-between gap-3">
                                <span className="text-ink-muted shrink-0">
                                  {t('booking.emailLabel')}
                                </span>
                                <span className="font-semibold text-ink truncate">
                                  {customer.email}
                                </span>
                              </div>
                            )}
                            {customer.note && (
                              <div className="flex justify-between gap-3">
                                <span className="text-ink-muted shrink-0">
                                  {t('booking.noteLabel')}
                                </span>
                                <span className="font-semibold text-ink truncate">
                                  {customer.note}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-primary-subtle rounded-2xl p-6 border border-primary/30">
                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-sm font-bold text-ink-muted uppercase tracking-wider">
                            {t('booking.total')}
                          </span>
                          <span className="font-display font-bold text-3xl text-primary tabular-nums">
                            {formatPrice(finalPrice, lang)} VND
                          </span>
                        </div>
                        <div className="space-y-1.5 border-t border-primary/20 pt-3 text-xs">
                          <div className="flex justify-between text-ink-muted">
                            <span>{t('booking.basePrice')}</span>
                            <span className="tabular-nums">
                              {formatPrice(basePrice, lang)} VND
                            </span>
                          </div>
                          {membershipDiscount > 0 && (
                            <div className="flex justify-between text-status-success-text font-semibold">
                              <span>{t('booking.memberDiscount')}</span>
                              <span className="tabular-nums">
                                −{formatPrice(membershipDiscount, lang)} VND
                              </span>
                            </div>
                          )}
                          {creditUsed > 0 && (
                            <div className="flex justify-between text-info font-semibold">
                              <span>{t('booking.creditUsed')}</span>
                              <span className="tabular-nums">
                                −{formatPrice(creditUsed, lang)} VND
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row justify-between gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="btn-secondary"
                        disabled={submitting}
                      >
                        <CaretLeft size={18} />
                        {t('booking.back')}
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary sm:min-w-[200px]"
                      >
                        {submitting ? (
                          <>
                            <Spinner size={18} />
                            {t('booking.submitting')}
                          </>
                        ) : (
                          t('booking.confirmBooking')
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function BookingFlowFallback() {
  return (
    <div className="min-h-[100dvh]">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto flex justify-center py-20 text-primary">
          <Spinner size={36} />
        </div>
      </main>
    </div>
  );
}

export default function BookingFlow() {
  return (
    <Suspense fallback={<BookingFlowFallback />}>
      <BookingFlowInner />
    </Suspense>
  );
}

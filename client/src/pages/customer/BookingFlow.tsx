import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle2, ChevronRight, ChevronLeft, CreditCard, Info } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Spinner from '../../components/Spinner';
import MemberSearch from '../../components/MemberSearch';
import PriceBreakdown from '../../components/PriceBreakdown';
import { courtsApi } from '../../api/courts';
import { bookingsApi } from '../../api/bookings';
import { useAuthStore } from '../../store/auth.store';
import type { Court, Member } from '../../types';

const STEP_KEYS = ['booking.steps.courtInfo', 'booking.steps.yourInfo', 'booking.steps.confirm'];

function StepIndicator({ current, t }: { current: number; t: any }) {
  return (
    <div className="flex items-center justify-between max-w-md mx-auto mb-12 relative">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0" />

      {/* Active Line */}
      <motion.div
        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0"
        initial={{ width: '0%' }}
        animate={{ width: `${(current / (STEP_KEYS.length - 1)) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {STEP_KEYS.map((key, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'future';
        return (
          <div key={key} className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{
                scale: state === 'active' ? 1.2 : 1,
                backgroundColor: state === 'done' || state === 'active' ? '#ccff00' : '#1c1c1f',
                color: state === 'done' || state === 'active' ? '#0a0a0b' : '#6b7280'
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shadow-lg"
            >
              {state === 'done' ? <CheckCircle2 size={20} /> : i + 1}
            </motion.div>
            <span className={`absolute top-12 whitespace-nowrap text-[10px] uppercase tracking-widest font-bold ${state === 'active' ? 'text-primary' : 'text-gray-500'}`}>
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

export default function BookingFlow() {
  const { t } = useTranslation();
  const { lang = 'en' } = useParams<{ lang: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const courtIdParam = searchParams.get('courtId');
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Step 1 state
  const [courtId] = useState<number>(courtIdParam ? Number(courtIdParam) : 0);
  const [date, setDate] = useState(searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(searchParams.get('time') ?? '09:00');
  const [duration, setDuration] = useState(Number(searchParams.get('duration') ?? 1));

  // Step 2 state
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
    queryFn: async () => {
      const courts = await courtsApi.list();
      const found = courts.find((c) => c.id === courtId);
      if (!found) throw new Error('Court not found');
      return found;
    },
    enabled: courtId > 0,
  });

  const { data: availability } = useQuery({
    queryKey: ['availability', courtId, date],
    queryFn: () => courtsApi.getAvailability(courtId, date),
    enabled: courtId > 0 && !!date,
  });

  const isPeak = court ? isPeakTime(time, court.peakStart, court.peakEnd) : false;
  const hourlyRate = court ? (isPeak ? court.pricePeak : court.priceNormal) : 0;
  const basePrice = hourlyRate * duration;
  
  const membershipDiscount = linkedMember?.memberships?.[0]
    ? Math.floor((basePrice * (linkedMember.memberships[0].plan === 'vip' ? 35 : linkedMember.memberships[0].plan === 'prime' ? 20 : 10)) / 100)
    : 0;
  
  const creditUsed = customer.useCredit && linkedMember?.memberships?.[0]
    ? Math.min(customer.creditAmount, basePrice - membershipDiscount)
    : 0;
  const finalPrice = Math.max(0, basePrice - membershipDiscount - creditUsed);

  const nextStep = () => {
    setDirection(1);
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(s => s - 1);
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
        ...(customer.useCredit ? { useCredit: true, creditAmount: customer.creditAmount } : {}),
        ...(customer.useGuestPass ? { useGuestPass: true } : {}),
        ...(customer.note ? { note: customer.note } : {}),
      };
      const res = await bookingsApi.create(payload);
      const ref = res?.data?.ref ?? res?.ref ?? 'N/A';
      navigate(`/${lang}/booking/success?ref=${ref}`);
    } catch (err: any) {
      setApiError(err?.response?.data?.error?.message ?? t('booking.bookingFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen">
      <div className="bg-shape shape-1 opacity-10" />
      <div className="bg-shape shape-2 opacity-10" />
      
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-display font-black text-white mb-3">{t('booking.title')} <span className="text-primary italic">{t('booking.titleHighlight')}</span></h1>
            <p className="text-gray-500 font-medium tracking-wide uppercase text-[10px]">{t('booking.subtitle')}</p>
          </motion.div>

          <StepIndicator current={step} t={t} />

          <div className="relative mt-20">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                {/* Step 0: Court Info */}
                {step === 0 && (
                  <div className="glass-card p-8 border-white/10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Calendar size={20} />
                      </div>
                      <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">{t('booking.courtSchedule')}</h2>
                    </div>

                    {courtLoading && (
                      <div className="flex justify-center py-12">
                        <Spinner size={40} />
                      </div>
                    )}

                    {court && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-surface-lighter flex items-center justify-center text-primary font-black text-lg border border-white/5">
                            {court.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-white text-lg">{court.name}</h3>
                            <p className="text-[10px] uppercase font-bold text-primary tracking-widest">{court.sport}</p>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end gap-1">
                          <p className="text-sm font-bold text-white">
                            {court.priceNormal.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">VND/{t('home.perHour')} ({t('booking.normalPrice')})</span>
                          </p>
                          <p className="text-xs font-bold text-amber-400">
                            {court.pricePeak.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal italic">VND/{t('home.perHour')} (Peak: {court.peakStart}-{court.peakEnd})</span>
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">{t('booking.date')}</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                          <input
                            type="date"
                            value={date}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            onChange={(e) => setDate(e.target.value)}
                            className="input-field pl-12 py-3.5"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">{t('booking.startTime')}</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="input-field pl-12 py-3.5"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">{t('booking.suggestedSlots')}</label>
                        {availability && (
                          <div className="flex flex-wrap gap-2">
                            {availability.slots.map((slot) => (
                              <button
                                key={slot.time}
                                onClick={() => slot.available && setTime(slot.time)}
                                disabled={!slot.available}
                                className={`text-[11px] font-bold px-4 py-2 rounded-xl border transition-all ${
                                  time === slot.time
                                    ? 'bg-primary text-background border-primary shadow-neon'
                                    : slot.available
                                    ? 'bg-white/5 border-white/10 text-gray-400 hover:border-primary/50 hover:text-white'
                                    : 'opacity-20 border-white/5 text-gray-600 cursor-not-allowed line-through'
                                }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">{t('booking.duration')}</label>
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 1.5, 2, 2.5, 3].map((d) => (
                            <button
                              key={d}
                              onClick={() => setDuration(d)}
                              className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                                duration === d 
                                  ? 'bg-primary text-background border-primary shadow-neon' 
                                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                              }`}
                            >
                              {d}h
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 flex justify-end">
                      <button
                        onClick={nextStep}
                        disabled={!court || !date || !time}
                        className="btn-primary group"
                      >
                        {t('booking.continue')}
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 1: Your Info */}
                {step === 1 && (
                  <div className="glass-card p-8 border-white/10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <User size={20} />
                      </div>
                      <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">{t('booking.customerInfo')}</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">{t('booking.fullName')}</label>
                          <input
                            type="text"
                            value={customer.name}
                            onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
                            placeholder={t('auth.namePlaceholder')}
                            disabled={!!user}
                            className={`input-field ${user ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">{t('booking.phoneNumber')}</label>
                          <input
                            type="tel"
                            value={customer.phone}
                            onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
                            placeholder="09xx xxx xxx"
                            disabled={!!user}
                            className={`input-field ${user ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">{t('booking.emailOptional')}</label>
                        <input
                          type="email"
                          value={customer.email}
                          onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))}
                          placeholder="example@gmail.com"
                          disabled={!!user}
                          className={`input-field ${user ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </div>

                      {!user && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-background">
                              <CreditCard size={16} />
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-tight">{t('booking.memberBenefits')}</span>
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
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="mt-4 bg-background/50 rounded-xl p-4 border border-white/5"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-white">{linkedMember.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-primary text-background font-black uppercase">
                                  {linkedMember.memberships[0].plan}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 font-medium">
                                {t('booking.discount')}: <span className="text-primary">{linkedMember.memberships[0].plan === 'vip' ? 35 : linkedMember.memberships[0].plan === 'prime' ? 20 : 10}%</span> ·
                                {t('booking.credit')}: <span className="text-primary">{linkedMember.memberships[0].creditBalance.toLocaleString()} VND</span>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">{t('booking.additionalNotes')}</label>
                        <textarea
                          value={customer.note}
                          onChange={(e) => setCustomer((p) => ({ ...p, note: e.target.value }))}
                          rows={2}
                          placeholder={t('booking.notesPlaceholder')}
                          className="input-field resize-none h-24"
                        />
                      </div>

                      {court && (
                        <div className="pt-6">
                          <PriceBreakdown
                            basePrice={basePrice}
                            discountAmount={membershipDiscount}
                            creditUsed={creditUsed}
                            finalPrice={finalPrice}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-12 flex justify-between">
                      <button
                        onClick={prevStep}
                        className="btn-secondary group"
                      >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        {t('booking.back')}
                      </button>
                      <button
                        onClick={nextStep}
                        disabled={!customer.name || (!user && !customer.phone)}
                        className="btn-primary group"
                      >
                        {t('booking.review')}
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Review */}
                {step === 2 && court && (
                  <div className="glass-card p-8 border-white/10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <CheckCircle2 size={20} />
                      </div>
                      <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">{t('booking.confirmTitle')}</h2>
                    </div>

                    {apiError && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-6 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-bold flex items-center gap-2"
                      >
                        <Info size={18} />
                        {apiError}
                      </motion.div>
                    )}

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Court Summary */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-3">{t('booking.courtDetails')}</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">{t('booking.court')}</span>
                              <span className="text-xs font-bold text-white">{court.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">{t('booking.time')}</span>
                              <span className="text-xs font-bold text-white">{time} ({duration}h)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">{t('booking.dateLabel')}</span>
                              <span className="text-xs font-bold text-white">{date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">{t('booking.timeType')}</span>
                              <span className={`text-xs font-bold ${isPeak ? 'text-amber-400' : 'text-primary'}`}>{isPeak ? t('booking.peakTime') : t('booking.normalTime')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Summary */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-3">{t('booking.bookerInfo')}</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">{t('booking.nameLabel')}</span>
                              <span className="text-xs font-bold text-white">{customer.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-400">{t('booking.phoneLabel')}</span>
                              <span className="text-xs font-bold text-white">{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-400">{t('booking.emailLabel')}</span>
                                <span className="text-xs font-bold text-white truncate ml-4">{customer.email}</span>
                              </div>
                            )}
                            {customer.note && (
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-400">{t('booking.noteLabel')}</span>
                                <span className="text-xs font-bold text-white truncate ml-4">{customer.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Final Price */}
                      <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('booking.total')}</span>
                          <span className="text-3xl font-display font-black text-primary italic">{finalPrice.toLocaleString()} VND</span>
                        </div>
                        <div className="space-y-2 border-t border-primary/10 pt-4">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            <span>{t('booking.basePrice')}</span>
                            <span>{basePrice.toLocaleString()} VND</span>
                          </div>
                          {membershipDiscount > 0 && (
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary">
                              <span>{t('booking.memberDiscount')}</span>
                              <span>-{membershipDiscount.toLocaleString()} VND</span>
                            </div>
                          )}
                          {creditUsed > 0 && (
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-secondary">
                              <span>{t('booking.creditUsed')}</span>
                              <span>-{creditUsed.toLocaleString()} VND</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 flex justify-between">
                      <button
                        onClick={prevStep}
                        className="btn-secondary group"
                        disabled={submitting}
                      >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        {t('booking.back')}
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary min-w-[200px]"
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

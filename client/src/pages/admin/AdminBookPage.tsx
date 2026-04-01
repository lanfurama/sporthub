import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import { courtsApi } from '../../api/courts';
import { bookingsApi } from '../../api/bookings';
import MemberSearch from '../../components/MemberSearch';
import TimeSlotGrid from '../../components/TimeSlotGrid';
import PriceBreakdown from '../../components/PriceBreakdown';
import Spinner from '../../components/Spinner';
import type { Court, Member } from '../../types';
import { format } from 'date-fns';

const DURATIONS = [1, 1.5, 2, 2.5, 3];

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

export default function AdminBookPage() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [selectedSport, setSelectedSport] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [useCredit, setUseCredit] = useState(false);
  const [creditAmount, setCreditAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('cash');
  const [note, setNote] = useState('');

  const { data: courts, isLoading: courtsLoading } = useQuery({
    queryKey: ['courts', selectedSport],
    queryFn: () => courtsApi.list({ ...(selectedSport ? { sport: selectedSport } : {}) }),
  });

  const { data: availability } = useQuery({
    queryKey: ['availability', selectedCourt?.id, date],
    queryFn: () => (selectedCourt ? courtsApi.getAvailability(selectedCourt.id, date) : null),
    enabled: !!selectedCourt && !!date,
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: any) => bookingsApi.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      alert('Đặt sân thành công!');
      // Reset form
      setSelectedCourt(null);
      setTime('09:00');
      setCustomerName('');
      setCustomerPhone('');
      setSelectedMember(null);
      setUseCredit(false);
      setCreditAmount(0);
      setNote('');
    },
  });

  const handleSubmit = async () => {
    if (!selectedCourt || !customerName || !customerPhone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const isPeak = selectedCourt ? isPeakTime(time, selectedCourt.peakStart, selectedCourt.peakEnd) : false;
    const hourlyRate = isPeak ? selectedCourt.pricePeak : selectedCourt.priceNormal;
    const basePrice = hourlyRate * duration;
    const membershipDiscount = selectedMember?.memberships?.[0]
      ? Math.floor((basePrice * (selectedMember.memberships[0].plan === 'vip' ? 35 : selectedMember.memberships[0].plan === 'prime' ? 20 : 10)) / 100)
      : 0;
    const creditUsed = useCredit ? Math.min(creditAmount, basePrice - membershipDiscount) : 0;

    try {
      await createBookingMutation.mutateAsync({
        courtId: selectedCourt.id,
        date,
        time,
        duration,
        customer: {
          name: customerName,
          phone: customerPhone,
        },
        ...(selectedMember ? { memberId: selectedMember.id } : {}),
        ...(useCredit ? { useCredit: true, creditAmount: creditUsed } : {}),
        payMethod,
        ...(note ? { note } : {}),
      });
    } catch (error: any) {
      alert(error?.response?.data?.error?.message || 'Đặt sân thất bại');
    }
  };

  const isPeak = selectedCourt ? isPeakTime(time, selectedCourt.peakStart, selectedCourt.peakEnd) : false;
  const hourlyRate = selectedCourt ? (isPeak ? selectedCourt.pricePeak : selectedCourt.priceNormal) : 0;
  const basePrice = hourlyRate * duration;
  const membershipDiscount = selectedMember?.memberships?.[0]
    ? Math.floor((basePrice * (selectedMember.memberships[0].plan === 'vip' ? 35 : selectedMember.memberships[0].plan === 'prime' ? 20 : 10)) / 100)
    : 0;
  const creditUsed = useCredit ? Math.min(creditAmount, basePrice - membershipDiscount) : 0;
  const finalPrice = Math.max(0, basePrice - membershipDiscount - creditUsed);

  const allSlots = availability?.slots || [];
  const availableSlots = allSlots.map((s) => s.time);
  const bookedSlots = allSlots.filter((s) => !s.available).map((s) => s.time);
  const peakSlots = allSlots.filter((s) => s.isPeak).map((s) => s.time);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <header className="flex flex-col">
        <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">Direct <span className="text-primary italic">Booking</span></h1>
        <p className="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-widest">Manual reservation for walk-in clients</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Court Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sport Filter */}
          <div className="flex bg-surface-lighter p-1.5 rounded-2xl border border-white/5 w-fit shadow-2xl">
            <button
              onClick={() => setSelectedSport('')}
              className={`px-5 h-9 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all ${
                !selectedSport ? 'bg-primary text-background shadow-neon' : 'text-gray-500 hover:text-white'
              }`}
            >
              All Sports
            </button>
            {['Tennis', 'Pickleball', 'Badminton'].map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-5 h-9 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  selectedSport === sport ? 'bg-primary text-background shadow-neon' : 'text-gray-500 hover:text-white'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Courts Grid */}
          {courtsLoading ? (
            <div className="glass-card p-20 flex justify-center border-white/5 shadow-2xl">
              <Spinner size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courts?.map((court) => (
                <div
                  key={court.id}
                  onClick={() => setSelectedCourt(court)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group overflow-hidden ${
                    selectedCourt?.id === court.id
                      ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(204,255,0,0.1)]'
                      : 'border-white/5 bg-surface hover:border-white/10 shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className={`text-lg font-display font-black transition-colors ${selectedCourt?.id === court.id ? 'text-primary' : 'text-white'}`}>
                        {court.name}
                      </h3>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{court.sport}</p>
                    </div>
                    <span
                      className={`text-[9px] font-black px-2.5 py-1 rounded-lg border ${
                        court.status === 'active'
                          ? 'bg-status-success-bg text-status-success-text border-status-success-border'
                          : 'bg-status-danger-bg text-status-danger-text border-status-danger-border'
                      }`}
                    >
                      {court.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Standard</span>
                      <span className="text-[16px] font-display font-black text-white">{court.priceNormal.toLocaleString()}<span className="text-[10px] font-normal text-gray-500 ml-1 uppercase">vnd/h</span></span>
                    </div>
                    <div className="w-px h-8 bg-white/5" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Peak Time</span>
                      <span className="text-[16px] font-display font-black text-primary">{court.pricePeak.toLocaleString()}<span className="text-[10px] font-normal text-gray-500 ml-1 uppercase">vnd/h</span></span>
                    </div>
                  </div>

                  {selectedCourt?.id === court.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-6 border-t border-white/5"
                    >
                      <TimeSlotGrid
                        slots={availableSlots}
                        selected={time}
                        onSelect={setTime}
                        bookedSlots={bookedSlots}
                        peakSlots={peakSlots}
                      />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Booking Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 border-white/5 shadow-2xl sticky top-4">
            <h2 className="text-sm font-black text-white mb-6 pb-4 border-b border-white/5 flex items-center gap-2 uppercase tracking-widest">
              <Zap className="w-4 h-4 text-primary fill-primary/20" />
              Reservation Entry
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field py-2.5 text-xs font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="input-field py-2.5 text-xs font-bold appearance-none"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d} className="bg-surface text-white">
                        {d} {d === 1 ? 'Hour' : 'Hours'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Find Member (Optional)</label>
                <div className="relative group">
                  <MemberSearch onSelect={setSelectedMember} selectedMember={selectedMember} />
                </div>
                {selectedMember?.memberships?.[0] && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{selectedMember.memberships[0].plan} VIP</div>
                      <div className="text-[14px] font-display font-black text-white">
                        {selectedMember.memberships[0].creditBalance.toLocaleString()} <span className="text-[9px] font-normal text-gray-500 uppercase">vnd</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-neon">
                      <Zap className="w-5 h-5 fill-primary" />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Robert"
                    className="input-field py-2.5 text-xs font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Phone</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="09xx..."
                    className="input-field py-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              {selectedMember?.memberships?.[0] && selectedMember.memberships[0].creditBalance > 0 && (
                <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={useCredit}
                        onChange={(e) => {
                          setUseCredit(e.target.checked);
                          if (e.target.checked) {
                            setCreditAmount(
                              Math.min(
                                selectedMember.memberships![0].creditBalance,
                                basePrice - membershipDiscount,
                              ),
                            );
                          }
                        }}
                        className="w-5 h-5 rounded-lg border-white/10 bg-surface text-primary focus:ring-primary focus:ring-offset-0 transition-all checked:border-primary"
                      />
                    </div>
                    <span className="text-[11px] font-black text-gray-400 group-hover:text-primary uppercase tracking-tight transition-colors">Apply Wallet Balance</span>
                  </label>
                  {useCredit && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <input
                        type="number"
                        min={0}
                        max={Math.min(selectedMember.memberships[0].creditBalance, basePrice - membershipDiscount)}
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(Number(e.target.value))}
                        className="w-full h-10 px-4 rounded-xl border-primary bg-primary/5 text-[14px] font-display font-black text-primary focus:ring-0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary uppercase">vnd</span>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Payment</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="input-field py-2.5 text-xs font-bold appearance-none"
                >
                  <option value="cash" className="bg-surface">Cash On Desk</option>
                  <option value="card" className="bg-surface">POS Terminal</option>
                  <option value="vnpay" className="bg-surface">VNPay QR</option>
                </select>
              </div>

              {selectedCourt && (
                <div className="py-4 border-t border-white/5">
                  <PriceBreakdown
                    basePrice={basePrice}
                    discountAmount={membershipDiscount}
                    creditUsed={creditUsed}
                    finalPrice={finalPrice}
                    isDark={true}
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!selectedCourt || !customerName || !customerPhone || createBookingMutation.isPending}
                className="w-full h-14 rounded-2xl bg-primary text-background font-black text-[15px] hover:bg-primary-hover shadow-neon transition-all flex items-center justify-center gap-2 disabled:opacity-20 active:scale-[0.98] uppercase tracking-widest"
              >
                {createBookingMutation.isPending ? <Spinner size={20} /> : <ChevronRight className="w-5 h-5" />}
                {createBookingMutation.isPending ? 'Processing...' : 'Secure Reservation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

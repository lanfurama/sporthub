import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    <div>
      <h1 className="text-2xl font-bold text-text-base mb-6">Đặt sân tại quầy</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Court Selection */}
        <div className="lg:col-span-2">
          {/* Sport Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedSport('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedSport
                  ? 'bg-indigo text-white'
                  : 'bg-bg-deep border border-border-dark text-muted hover:text-text-base'
              }`}
            >
              Tất cả
            </button>
            {['Tennis', 'Pickleball', 'Badminton'].map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSport === sport
                    ? 'bg-indigo text-white'
                    : 'bg-bg-deep border border-border-dark text-muted hover:text-text-base'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Courts Grid */}
          {courtsLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size={36} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courts?.map((court) => (
                <div
                  key={court.id}
                  onClick={() => setSelectedCourt(court)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    selectedCourt?.id === court.id
                      ? 'border-green bg-green/10'
                      : 'border-border-dark bg-bg-panel hover:border-indigo/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-text-base">{court.name}</h3>
                      <p className="text-sm text-muted">{court.sport}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        court.status === 'active'
                          ? 'bg-green/10 text-green border border-green/20'
                          : 'bg-red/10 text-red border border-red/20'
                      }`}
                    >
                      {court.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted mb-3">
                    {court.priceNormal.toLocaleString()} VND/hr · Peak:{' '}
                    {court.pricePeak.toLocaleString()} VND/hr
                  </div>
                  {selectedCourt?.id === court.id && availability && (
                    <TimeSlotGrid
                      slots={availableSlots}
                      selected={time}
                      onSelect={setTime}
                      bookedSlots={bookedSlots}
                      peakSlots={peakSlots}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-bg-panel border border-border-dark rounded-xl p-4 sticky top-4">
            <h2 className="text-lg font-semibold text-text-base mb-4">Thông tin đặt sân</h2>

            <div className="space-y-4">
              {/* Date & Duration */}
              <div>
                <label className="block text-sm font-medium text-text-base mb-1.5">Ngày</label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-base mb-1.5">Thời lượng</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} giờ
                    </option>
                  ))}
                </select>
              </div>

              {/* Member Search */}
              <div>
                <label className="block text-sm font-medium text-text-base mb-1.5">
                  Tìm thành viên (tùy chọn)
                </label>
                <MemberSearch onSelect={setSelectedMember} selectedMember={selectedMember} />
                {selectedMember?.memberships?.[0] && (
                  <div className="mt-2 p-2 bg-amber/10 border border-amber/20 rounded-lg text-xs">
                    <div className="font-medium text-amber">
                      {selectedMember.memberships[0].plan.toUpperCase()} Member
                    </div>
                    <div className="text-muted">
                      Credit: {selectedMember.memberships[0].creditBalance.toLocaleString()} VND
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div>
                <label className="block text-sm font-medium text-text-base mb-1.5">Tên khách *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-base mb-1.5">SĐT *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo"
                />
              </div>

              {/* Credit */}
              {selectedMember?.memberships?.[0] && selectedMember.memberships[0].creditBalance > 0 && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
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
                      className="w-4 h-4 rounded accent-indigo"
                    />
                    <span className="text-sm text-text-base">Dùng credit</span>
                  </label>
                  {useCredit && (
                    <input
                      type="number"
                      min={0}
                      max={Math.min(selectedMember.memberships[0].creditBalance, basePrice - membershipDiscount)}
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(Number(e.target.value))}
                      className="w-full mt-2 px-3 py-2 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo"
                    />
                  )}
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-text-base mb-1.5">Phương thức thanh toán</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="card">Thẻ</option>
                  <option value="vnpay">VNPay</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-text-base mb-1.5">Ghi chú</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo resize-none"
                />
              </div>

              {/* Price Breakdown */}
              {selectedCourt && (
                <PriceBreakdown
                  basePrice={basePrice}
                  discountAmount={membershipDiscount}
                  creditUsed={creditUsed}
                  finalPrice={finalPrice}
                />
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!selectedCourt || !customerName || !customerPhone || createBookingMutation.isPending}
                className="w-full px-4 py-3 rounded-lg bg-green text-white font-semibold text-sm hover:bg-green/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {createBookingMutation.isPending ? <Spinner size={16} /> : null}
                Xác nhận đặt sân
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

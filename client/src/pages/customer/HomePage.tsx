import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Clock, Hourglass, Trophy, Target, Zap, PlayCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Spinner from '../../components/Spinner';
import { courtsApi } from '../../api/courts';
import type { Court } from '../../types';

const SPORTS = [
  { id: 'Tennis',     label: 'Tennis',     icon: Trophy, color: 'from-blue-500/20 to-blue-600/20', accent: 'text-blue-400', border: 'border-blue-500/30' },
  { id: 'Pickleball', label: 'Pickleball', icon: Target, color: 'from-amber-500/20 to-amber-600/20', accent: 'text-amber-400', border: 'border-amber-500/30' },
  { id: 'Badminton',  label: 'Badminton',  icon: Zap,    color: 'from-primary/20 to-primary/40', accent: 'text-primary', border: 'border-primary/30' },
];

const DURATIONS = [1, 1.5, 2, 2.5, 3];

function CourtCard({ court, onBook, index }: { court: Court; onBook: () => void; index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 glass-card-hover group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Zap size={80} className="text-primary" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1 block">
              {court.sport}
            </span>
            <h3 className="text-xl font-display font-bold text-white group-hover:text-primary transition-colors">
              {court.name}
            </h3>
          </div>
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
              court.status === 'active'
                ? 'bg-status-success-bg text-status-success-text border-status-success-border'
                : 'bg-status-danger-bg text-status-danger-text border-status-danger-border'
            }`}
          >
            {court.status === 'active' ? 'Sẵn sàng' : court.status}
          </span>
        </div>

        {court.description && (
          <p className="text-sm text-gray-400 mb-6 line-clamp-2 h-10 leading-relaxed">
            {court.description}
          </p>
        )}

        <div className="space-y-3 mb-6 bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Giá thường</span>
            <span className="text-sm text-white font-bold">{court.priceNormal.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">VND/giờ</span></span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-amber-400" />
              <span className="text-xs text-amber-400 font-bold uppercase tracking-tight">Giá Peak</span>
            </div>
            <span className="text-sm text-amber-400 font-bold">{court.pricePeak.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">VND/giờ</span></span>
          </div>
          <div className="pt-2 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Khung giờ Peak</span>
            <span className="text-[11px] text-gray-400">{court.peakStart} – {court.peakEnd}</span>
          </div>
        </div>

        <button
          onClick={onBook}
          disabled={court.status !== 'active'}
          className="w-full btn-primary py-3 group-hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
        >
          Đặt ngay
        </button>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [selectedSport, setSelectedSport] = useState('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  const [searched, setSearched] = useState(false);

  const { data: allCourts } = useQuery({
    queryKey: ['courts', 'all'],
    queryFn: () => courtsApi.list(),
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

  const handleSearch = () => {
    setSearched(true);
  };

  const handleBook = (court: Court) => {
    const params = new URLSearchParams({
      courtId: String(court.id),
      date,
      time,
      duration: String(duration),
    });
    navigate(`/book?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-shape shape-1" />
      <div className="bg-shape shape-2" />
      
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Sẵn sàng cho trận đấu tiếp theo
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-7xl font-display font-black text-white mb-6 leading-[1.1] tracking-tighter"
            >
              CHINH PHỤC <span className="text-primary italic">MỌI SÂN ĐẤU</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium"
            >
              Hệ thống đặt sân chuyên nghiệp cho Tennis, Pickleball & Badminton. 
              Trải nghiệm nhanh chóng, thanh toán an toàn.
            </motion.p>

            {/* Sport Selectors */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {SPORTS.map((sport, i) => {
                const Icon = sport.icon;
                const courtCount = allCourts?.filter((c) => c.sport === sport.id).length || 0;
                const isActive = selectedSport === sport.id;

                return (
                  <motion.button
                    key={sport.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    onClick={() => setSelectedSport(isActive ? '' : sport.id)}
                    className={`relative flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 min-w-[200px] overflow-hidden group ${
                      isActive 
                        ? `bg-gradient-to-br ${sport.color} ${sport.border} ring-2 ring-primary/20 shadow-neon` 
                        : 'bg-surface/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${isActive ? 'bg-primary text-background' : 'bg-white/5 text-gray-400 group-hover:text-white transition-colors'}`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-left">
                      <div className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {sport.label}
                      </div>
                      <div className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                        {courtCount} SÂN CÓ SẴN
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="max-w-4xl mx-auto glass-card p-2 md:p-3 border-white/10 shadow-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <div className="md:col-span-3 group">
                  <div className="relative h-full">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="date"
                      value={date}
                      min={today}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-primary/30 focus:bg-white/10 transition-all appearance-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-3 group">
                  <div className="relative h-full">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-primary/30 focus:bg-white/10 transition-all appearance-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-3 group">
                  <div className="relative h-full">
                    <Hourglass className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:text-primary transition-colors" size={18} />
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-primary/30 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                    >
                      {DURATIONS.map((d) => (
                        <option key={d} value={d} className="bg-surface text-white">
                          {d} giờ thi đấu
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <button
                    onClick={handleSearch}
                    className="w-full h-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 group"
                  >
                    <Search size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="uppercase tracking-widest font-bold text-xs">Tìm sân ngay</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <AnimatePresence mode="wait">
            {!searched ? (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                  <Search className="text-primary" size={32} />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Sẵn sàng để bắt đầu?</h2>
                <p className="text-gray-500">Chọn môn thể thao và thời gian để tìm sân phù hợp nhất.</p>
              </motion.div>
            ) : isFetching ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Spinner size={48} />
                <p className="text-primary font-bold uppercase tracking-widest text-xs mt-6 animate-pulse">Đang tìm kiếm sân trống...</p>
              </motion.div>
            ) : isError ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 text-accent bg-accent/5 border border-accent/20 rounded-2xl"
              >
                <Zap size={40} className="mx-auto mb-4" />
                <p className="font-bold">Đã có lỗi xảy ra. Vui lòng thử lại sau.</p>
              </motion.div>
            ) : !courts || courts.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 glass-card border-white/5"
              >
                <div className="text-6xl mb-6">🏟️</div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Hết sân trống rồi!</h3>
                <p className="text-gray-500 max-w-md mx-auto">Chúng tôi không tìm thấy sân nào phù hợp với yêu cầu của bạn. Thử thay đổi thời gian hoặc ngày xem sao nhé.</p>
                <button 
                  onClick={() => setSearched(false)}
                  className="mt-8 text-primary font-bold uppercase tracking-widest text-xs hover:underline"
                >
                  Quay lại tìm kiếm
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-white">
                      Kết quả <span className="text-primary italic">tìm kiếm</span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Tìm thấy {courts.length} sân phù hợp</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {date}
                    </span>
                    <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">
                      {time}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courts.map((court, i) => (
                    <CourtCard
                      key={court.id}
                      court={court}
                      onBook={() => handleBook(court)}
                      index={i}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
      
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-display font-bold text-white tracking-tight">
              SPORT<span className="text-primary">HUB</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Nền tảng quản lý và đặt sân thể thao hàng đầu. 
            Kết nối cộng đồng đam mê vận động.
          </p>
          <div className="mt-8 flex justify-center gap-6">
            {['Facebook', 'Instagram', 'TikTok'].map(social => (
              <a key={social} href="#" className="text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">
                {social}
              </a>
            ))}
          </div>
          <p className="mt-12 text-[10px] text-gray-600 uppercase tracking-[0.2em]">
            © 2026 SportHub Platform. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

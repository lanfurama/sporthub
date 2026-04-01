import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, Calendar, Info } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') ?? 'N/A';

  return (
    <div className="min-h-screen">
      <div className="bg-shape shape-1 opacity-20" />
      <div className="bg-shape shape-2 opacity-10" />
      
      <Navbar />
      
      <main className="pt-20 flex items-center justify-center min-h-screen px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          {/* Celebratory Icon */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary shadow-neon mb-8"
          >
            <CheckCircle2 size={48} className="text-background" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-display font-black text-white mb-3 tracking-tight"
          >
            ĐẶT SÂN <span className="text-primary italic">THÀNH CÔNG!</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 font-medium mb-10"
          >
            Sân của bạn đã được giữ chỗ. Chúc bạn có một trận đấu tuyệt vời!
          </motion.p>

          {/* Booking Reference */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 border-white/10 mb-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Mã đặt sân của bạn</p>
            <p className="text-4xl font-display font-black text-primary tracking-[0.2em] group-hover:scale-105 transition-transform duration-500">{ref}</p>
            <p className="text-[10px] text-gray-600 mt-3 uppercase font-bold tracking-wider">Vui lòng lưu lại mã này để check-in</p>
          </motion.div>

          {/* Guidelines */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-10 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Info size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-3 uppercase tracking-tight">Cần lưu ý điều gì?</p>
                <ul className="text-xs text-gray-400 space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Lịch đặt đang chờ nhân viên xác nhận cuối cùng
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Vui lòng đến sớm 10 phút trước giờ thi đấu
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    Xuất trình mã đặt sân tại quầy lễ tân
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/book"
              className="btn-secondary group flex-1"
            >
              <Calendar size={18} className="group-hover:scale-110 transition-transform" />
              Đặt thêm sân khác
            </Link>
            <Link
              to="/"
              className="btn-primary group flex-1 shadow-neon"
            >
              <Home size={18} className="group-hover:scale-110 transition-transform" />
              Về trang chủ
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

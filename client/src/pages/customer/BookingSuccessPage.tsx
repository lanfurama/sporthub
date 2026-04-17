import { useSearchParams, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, Calendar, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const { lang = 'en' } = useParams<{ lang: string }>();
  const { t } = useTranslation();
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
            {t('bookingSuccess.title')} <span className="text-primary italic">{t('bookingSuccess.titleHighlight')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 font-medium mb-10"
          >
            {t('bookingSuccess.message')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 border-white/10 mb-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">{t('bookingSuccess.bookingRef')}</p>
            <p className="text-4xl font-display font-black text-primary tracking-[0.2em] group-hover:scale-105 transition-transform duration-500">{ref}</p>
            <p className="text-[10px] text-gray-600 mt-3 uppercase font-bold tracking-wider">{t('bookingSuccess.saveRef')}</p>
          </motion.div>

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
                <p className="text-sm font-bold text-white mb-3 uppercase tracking-tight">{t('bookingSuccess.guidelinesTitle')}</p>
                <ul className="text-xs text-gray-400 space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {t('bookingSuccess.guideline1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {t('bookingSuccess.guideline2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {t('bookingSuccess.guideline3')}
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to={`/${lang}/book`}
              className="btn-secondary group flex-1"
            >
              <Calendar size={18} className="group-hover:scale-110 transition-transform" />
              {t('bookingSuccess.bookAnother')}
            </Link>
            <Link
              to={`/${lang}`}
              className="btn-primary group flex-1 shadow-neon"
            >
              <Home size={18} className="group-hover:scale-110 transition-transform" />
              {t('bookingSuccess.goHome')}
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

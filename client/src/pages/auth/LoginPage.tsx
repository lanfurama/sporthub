import { useState, type FormEvent } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ChevronRight, PlayCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth.store';
import Spinner from '../../components/Spinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { lang = 'en' } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      login(token, user);
      const adminRoles = ['admin', 'super_admin', 'staff'];
      if (adminRoles.includes(user.role)) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(`/${lang}`, { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="bg-shape shape-1 opacity-20" />
      <div className="bg-shape shape-2 opacity-10" />

      <div className="w-full max-w-[400px] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <Link to={`/${lang}`} className="flex items-center gap-3 group mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-neon"
            >
              <PlayCircle className="w-8 h-8 text-background" />
            </motion.div>
            <span className="text-2xl font-display font-black text-white tracking-tight">
              SPORT<span className="text-primary italic">HUB</span>
            </span>
          </Link>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">{t('auth.platformTagline')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap size={100} className="text-primary" />
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-2 uppercase tracking-tight">{t('auth.loginTitle')}</h2>
          <p className="text-xs text-gray-500 mb-8 font-medium">{t('auth.loginSubtitle')}</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-bold"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="input-field pl-12 py-3.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('auth.password')}</label>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest cursor-default opacity-50">{t('auth.forgotPassword')}</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field pl-12 py-3.5"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 mt-4 shadow-neon group"
            >
              {loading ? (
                <>
                  <Spinner size={18} />
                  {t('auth.authenticating')}
                </>
              ) : (
                <>
                  {t('auth.loginButton')}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500 font-medium">
              {t('auth.noAccount')} <Link to={`/${lang}/register`} className="text-primary font-bold hover:underline">{t('auth.registerLink')}</Link>
            </p>
          </div>
        </motion.div>

        <p className="mt-12 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
          {t('auth.copyright')}
        </p>
      </div>
    </div>
  );
}

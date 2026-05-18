import { useState, type FormEvent } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ChevronRight, Activity, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center px-4 md:px-6 py-12 bg-court-pattern">
      <div className="w-full max-w-[420px]">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <Link to={`/${lang}`} className="flex items-center gap-3 mb-3" aria-label="SportHub home">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-sport">
              <Activity className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-display font-bold text-ink tracking-tight">
              Sport<span className="text-primary">Hub</span>
            </span>
          </Link>
          <p className="text-xs text-ink-muted font-semibold tracking-wide">
            {t('auth.platformTagline')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="sport-card p-6 md:p-8"
        >
          <h1 className="text-2xl font-display font-bold text-ink mb-1">{t('auth.loginTitle')}</h1>
          <p className="text-sm text-ink-muted mb-6">{t('auth.loginSubtitle')}</p>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 px-3.5 py-3 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger-text text-sm"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-bold text-ink-muted">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
                  size={16}
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-bold text-ink-muted">
                  {t('auth.password')}
                </label>
                <Link
                  to={`/${lang}/login`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="text-xs font-bold text-ink-subtle pointer-events-none select-none"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
                  size={16}
                />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <>
                  <Spinner size={18} />
                  {t('auth.authenticating')}
                </>
              ) : (
                <>
                  {t('auth.loginButton')}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-sm text-ink-muted">
              {t('auth.noAccount')}{' '}
              <Link
                to={`/${lang}/register`}
                className="text-primary font-bold hover:text-primary-hover hover:underline"
              >
                {t('auth.registerLink')}
              </Link>
            </p>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-[11px] text-ink-subtle font-medium">
          {t('auth.copyright')}
        </p>
      </div>
    </div>
  );
}

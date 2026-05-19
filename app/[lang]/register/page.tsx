'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/src/i18n/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { authApi } from '@/src/lib/api/auth';
import { useAuthStore } from '@/src/lib/auth-store';
import Spinner from '@/components/Spinner';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? 'en';
  const t = useTranslations();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        ...(form.phone ? { phone: form.phone } : {}),
      };
      const { token, user } = await authApi.register(payload);
      login(token, user);
      router.replace(`/${lang}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
        t('auth.registerFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-6 py-12 bg-court-pattern">
      <div className="w-full max-w-[460px]">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <Link href="/" className="flex items-center gap-3 mb-3" aria-label="SportHub home">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-sport">
              <Activity className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-display font-bold text-ink tracking-tight">
              Sport<span className="text-primary">Hub</span>
            </span>
          </Link>
          <p className="text-xs text-ink-muted font-semibold tracking-wide">
            {t('auth.journeyTagline')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="sport-card p-6 md:p-8"
        >
          <h1 className="text-2xl font-display font-bold text-ink mb-1">{t('auth.registerTitle')}</h1>
          <p className="text-sm text-ink-muted mb-6">{t('auth.registerSubtitle')}</p>

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
              <label htmlFor="reg-name" className="text-xs font-bold text-ink-muted">
                {t('auth.name')}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" size={16} />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder={t('auth.namePlaceholder')}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-xs font-bold text-ink-muted">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" size={16} />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-phone" className="text-xs font-bold text-ink-muted">
                {t('auth.phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" size={16} />
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t('auth.phonePlaceholder')}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="text-xs font-bold text-ink-muted">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" size={16} />
                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-confirm" className="text-xs font-bold text-ink-muted">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" size={16} />
                  <input
                    id="reg-confirm"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <>
                  <Spinner size={18} />
                  {t('auth.processing')}
                </>
              ) : (
                <>
                  {t('auth.registerButton')}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-sm text-ink-muted">
              {t('auth.hasAccount')}{' '}
              <Link
                href="/login"
                className="text-primary font-bold hover:text-primary-hover hover:underline"
              >
                {t('auth.loginLink')}
              </Link>
            </p>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-xs text-ink-subtle font-medium px-4">
          {t('auth.termsAgreement')}
        </p>
      </div>
    </div>
  );
}

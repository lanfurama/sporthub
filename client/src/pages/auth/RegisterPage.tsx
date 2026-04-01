import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth.store';
import Spinner from '../../components/Spinner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
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
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v20M2 12h20" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-text-base">
              Sport<span className="text-indigo">Hub</span>
            </span>
          </div>
          <h1 className="text-xl font-semibold text-text-base">Create your account</h1>
          <p className="text-sm text-muted mt-1">Join SportHub today</p>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-border-dark rounded-2xl p-8">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red/10 border border-red/30 text-red text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-base mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-lg border border-border-dark bg-bg-panel text-text-base placeholder-muted text-sm focus:outline-none focus:border-indigo transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-base mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-border-dark bg-bg-panel text-text-base placeholder-muted text-sm focus:outline-none focus:border-indigo transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-base mb-1.5">
                Phone{' '}
                <span className="text-muted font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+66 81 234 5678"
                className="w-full px-4 py-2.5 rounded-lg border border-border-dark bg-bg-panel text-text-base placeholder-muted text-sm focus:outline-none focus:border-indigo transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-base mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-2.5 rounded-lg border border-border-dark bg-bg-panel text-text-base placeholder-muted text-sm focus:outline-none focus:border-indigo transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo text-white font-semibold text-sm hover:bg-indigo/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Spinner size={18} /> : null}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo hover:text-indigo/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

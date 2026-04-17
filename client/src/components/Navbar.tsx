import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LogOut, LayoutDashboard, PlayCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { lang = 'en' } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const { scrollY } = useScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(10, 10, 11, 0)', 'rgba(18, 18, 20, 0.8)']
  );

  const backdropBlur = useTransform(
    scrollY,
    [0, 50],
    ['blur(0px)', 'blur(12px)']
  );

  const borderBottom = useTransform(
    scrollY,
    [0, 50],
    ['1px solid rgba(255, 255, 255, 0)', '1px solid rgba(255, 255, 255, 0.05)']
  );

  const handleLogout = () => {
    logout();
    navigate(`/${lang}/login`);
  };

  return (
    <motion.nav
      style={{ backgroundColor, backdropFilter: backdropBlur, borderBottom }}
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 transition-all"
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link to={`/${lang}`} className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-neon"
          >
            <PlayCircle className="w-6 h-6 text-background" />
          </motion.div>
          <span className="text-xl font-display font-bold text-white tracking-tight">
            SPORT<span className="text-primary">HUB</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to={`/${lang}`}
            className="text-gray-400 hover:text-primary text-sm font-semibold tracking-wide uppercase transition-colors"
          >
            {t('nav.home')}
          </Link>
          <Link
            to={`/${lang}/book`}
            className="text-gray-400 hover:text-primary text-sm font-semibold tracking-wide uppercase transition-colors"
          >
            {t('nav.bookNow')}
          </Link>
        </div>

        {/* Auth section + Language Switcher */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-white leading-none">
                  {user.name}
                </span>
                <span className="text-[10px] text-primary uppercase tracking-widest font-bold mt-1">
                  {user.role}
                </span>
              </div>

              {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'staff') && (
                <Link
                  to="/admin/dashboard"
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:border-primary/30 transition-all"
                  title={t('nav.dashboard')}
                >
                  <LayoutDashboard size={20} />
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-accent hover:border-accent/30 transition-all"
                title={t('nav.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              to={`/${lang}/login`}
              className="btn-primary"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { useAuthStore } from '../store/auth.store';

const navItems = [
  {
    label: 'Overview',
    path: '/admin/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Bookings',
    path: '/admin/bookings',
    badge: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="16" rx="2" />
      </svg>
    ),
  },
  {
    label: 'New Entry',
    path: '/admin/book',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    label: 'Directory',
    path: '/admin/members',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
  },
  {
    label: 'Inventory',
    path: '/admin/products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
      </svg>
    ),
  },
  {
    label: 'Finance',
    path: '/admin/orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 10h10M7 14h10" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', 'pending'],
    queryFn: () => bookingsApi.list({ status: 'pending', limit: 1 }),
    refetchInterval: 30_000,
  });

  const pendingCount = bookingsData?.meta?.total ?? 0;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-surface border-r border-white/5 flex flex-col z-50 px-3 py-6">
      {/* Brand area */}
      <div className="flex items-center gap-3 px-3 mb-10">
        <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-neon">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-background" stroke="currentColor" strokeWidth="3">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[16px] font-display font-black tracking-tight text-white leading-none uppercase">
            Sport<span className="text-primary italic">Hub</span>
          </span>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">Admin Panel</span>
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 h-11 rounded-xl text-[13px] font-bold transition-all duration-300 group ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && pendingCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-lg bg-accent text-white shadow-lg shadow-accent/20">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="mt-auto pt-6 px-1">
        <div className="flex items-center gap-3 p-2.5 bg-white/5 rounded-2xl border border-white/5 group transition-all hover:border-white/10">
          <div className="w-9 h-9 rounded-xl bg-surface-lighter flex items-center justify-center text-[11px] font-black text-primary border border-white/5 shadow-inner">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white truncate">Administrator</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider truncate">System Online</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-accent p-2 hover:bg-white/5 rounded-xl transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

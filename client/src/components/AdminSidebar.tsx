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
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-gray-100/50 border-r border-border flex flex-col z-50 px-2 py-3">
      {/* Brand area */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="3">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
          </svg>
        </div>
        <span className="text-[14px] font-semibold tracking-tight text-gray-900">
          SportHub <span className="text-gray-400 font-normal">CRM</span>
        </span>
      </div>

      {/* Nav list */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 h-9 rounded-md text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-primary shadow-sm border border-border'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <span className={isActive ? 'text-primary' : 'text-gray-400'}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded bg-primary text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="mt-auto border-t border-border pt-3 px-1">
        <div className="flex items-center gap-2.5 px-2 py-2 hover:bg-gray-200/50 rounded-md transition-colors cursor-pointer group">
          <div className="w-7 h-7 rounded bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-gray-900 truncate">Administrator</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-900 p-1"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

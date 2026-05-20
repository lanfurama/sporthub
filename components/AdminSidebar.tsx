'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  SquaresFour,
  CalendarBlank,
  PlusCircle,
  Users,
  Package,
  Receipt,
  SignOut,
} from '@phosphor-icons/react';
import { bookingsApi } from '@/src/lib/api/bookings';
import { useAuthStore } from '@/src/lib/auth-store';

const navItems = [
  { label: 'Overview', path: '/admin/dashboard', Icon: SquaresFour },
  { label: 'Bookings', path: '/admin/bookings', Icon: CalendarBlank, badge: true },
  { label: 'New Entry', path: '/admin/book', Icon: PlusCircle },
  { label: 'Members', path: '/admin/members', Icon: Users },
  { label: 'Inventory', path: '/admin/products', Icon: Package },
  { label: 'Orders', path: '/admin/orders', Icon: Receipt },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/en/login');
  };

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings', 'pending'],
    queryFn: () => bookingsApi.list({ status: 'pending', limit: 1 }),
    refetchInterval: 30_000,
  });

  const pendingCount = bookingsData?.meta?.total ?? 0;

  const initials = (user?.name ?? 'AD')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-surface border-r border-border flex flex-col z-40 px-3 py-6">
      <div className="flex items-center gap-3 px-3 mb-10">
        <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-sport">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-foreground" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-display font-bold tracking-tight text-ink leading-none">
            Sport<span className="text-primary">Hub</span>
          </span>
          <span className="text-[10px] font-semibold text-ink-subtle uppercase tracking-[0.14em] mt-1">
            Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ label, path, Icon, badge }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-3 px-3.5 h-10 rounded-xl text-[13px] font-semibold transition-colors ${
                isActive
                  ? 'bg-primary-subtle text-primary'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-muted'
              }`}
            >
              <Icon
                size={18}
                weight={isActive ? 'fill' : 'regular'}
                className={isActive ? 'text-primary' : 'text-ink-subtle'}
              />
              <span className="flex-1">{label}</span>
              {badge && pendingCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-accent text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="flex items-center gap-3 p-2.5 bg-surface-muted rounded-2xl border border-border">
          <div className="w-9 h-9 rounded-xl bg-primary-subtle flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-ink truncate">{user?.name ?? 'Administrator'}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] text-ink-subtle font-medium truncate">Online</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            className="text-ink-subtle hover:text-accent p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <SignOut size={16} weight="regular" />
          </button>
        </div>
      </div>
    </aside>
  );
}

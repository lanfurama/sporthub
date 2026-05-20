'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarBlank, Hourglass, CurrencyCircleDollar, Users } from '@phosphor-icons/react';
import { analyticsApi } from '@/src/lib/api/analytics';
import Badge from '@/components/Badge';
import { Table, TableRow, TableCell } from '@/components/Table';
import { format } from 'date-fns';

const COLORS = {
  primary: '#10B981',
  info: '#0EA5E9',
  accent: '#F97316',
  gridLine: '#E2E8F0',
  axisText: '#64748B',
  tooltipBg: '#FFFFFF',
  tooltipBorder: '#E2E8F0',
};

function StatCardSkeleton() {
  return (
    <div className="sport-card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-surface-muted" />
      </div>
      <div className="h-3 w-24 bg-surface-muted rounded mb-2.5" />
      <div className="h-7 w-20 bg-surface-muted rounded" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="sport-card p-6 animate-pulse">
      <div className="h-3 w-32 bg-surface-muted rounded mb-6" />
      <div className="h-[240px] bg-surface-muted rounded-xl" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.dashboard(),
    refetchInterval: 30000,
  });

  const stats = dashboardData
    ? [
        {
          title: 'Active Bookings',
          value: dashboardData.today.bookingsCount,
          Icon: CalendarBlank,
          tone: 'text-primary bg-primary-subtle',
        },
        {
          title: 'Pending Approvals',
          value: dashboardData.today.pendingCount,
          Icon: Hourglass,
          tone: 'text-accent bg-accent-subtle',
        },
        {
          title: 'Net Revenue',
          value: `${(dashboardData.today.revenue / 1_000_000).toFixed(1)}M`,
          Icon: CurrencyCircleDollar,
          tone: 'text-info bg-info-subtle',
        },
        {
          title: 'Total Members',
          value: dashboardData.members.total,
          Icon: Users,
          tone: 'text-primary bg-primary-subtle',
        },
      ]
    : [];

  const bookingSourceData = dashboardData
    ? [
        { name: 'Online', value: dashboardData.sourceBreakdown.online },
        { name: 'Admin', value: dashboardData.sourceBreakdown.admin },
      ]
    : [];

  const dailyBookingsData =
    dashboardData?.dailyBookings?.map((d) => ({
      date: format(new Date(d.date), 'MM/dd'),
      bookings: d.bookings,
    })) ?? [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <header className="flex flex-col">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-ink tracking-tight">
          System Overview
        </h1>
        <p className="text-sm text-ink-muted mt-1.5">
          Real-time performance metrics
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat, i) => {
              const { Icon } = stat;
              return (
                <div key={i} className="sport-card sport-card-hover p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.tone}`}>
                      <Icon size={20} weight="regular" />
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.1em] mb-1.5">
                    {stat.title}
                  </div>
                  <div className="text-2xl font-display font-bold text-ink tabular-nums">
                    {stat.value}
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <div className="sport-card p-6">
              <h3 className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.12em] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Booking Volume (last 7 days)
              </h3>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyBookingsData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.gridLine} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: COLORS.axisText, fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: COLORS.axisText, fontWeight: 500 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
                      contentStyle={{
                        backgroundColor: COLORS.tooltipBg,
                        border: `1px solid ${COLORS.tooltipBorder}`,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0F172A',
                        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.08)',
                      }}
                    />
                    <Bar dataKey="bookings" fill={COLORS.primary} radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="sport-card p-6">
              <h3 className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.12em] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-info" />
                Source Breakdown
              </h3>
              <div className="h-[240px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingSourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={COLORS.primary} />
                      <Cell fill={COLORS.info} />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: COLORS.tooltipBg,
                        border: `1px solid ${COLORS.tooltipBorder}`,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0F172A',
                        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.08)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-2">
                {bookingSourceData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: i === 0 ? COLORS.primary : COLORS.info }}
                    />
                    <span className="text-xs font-medium text-ink-muted">{d.name}</span>
                    <span className="text-xs font-bold text-ink tabular-nums">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sport-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <Table headers={['Reference', 'Customer', 'Court', 'Time', 'Status', 'Total']}>
            {dashboardData?.recentBookings?.slice(0, 8).map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono text-primary font-semibold text-xs">
                  #{booking.ref}
                </TableCell>
                <TableCell className="font-semibold text-ink">{booking.customerName}</TableCell>
                <TableCell className="text-ink-muted">
                  {booking.court?.name ?? '—'}
                </TableCell>
                <TableCell className="text-ink-subtle text-xs tabular-nums">
                  {booking.bookingDate} · {booking.startTime}
                </TableCell>
                <TableCell>
                  <Badge status={booking.status} />
                </TableCell>
                <TableCell className="text-right font-semibold text-ink tabular-nums">
                  {booking.finalPrice.toLocaleString()}{' '}
                  <span className="text-[10px] text-ink-subtle font-normal">VND</span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {!isLoading && (!dashboardData?.recentBookings || dashboardData.recentBookings.length === 0) && (
            <div className="py-16 text-center text-sm text-ink-subtle">No recent bookings</div>
          )}
        </div>
      </div>
    </div>
  );
}

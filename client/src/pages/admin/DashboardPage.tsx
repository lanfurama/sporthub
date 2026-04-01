import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../api/analytics';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { Table, TableRow, TableCell } from '../../components/Table';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.dashboard(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Spinner size={32} />
      </div>
    );
  }

  const stats = dashboardData ? [
    {
      title: 'Active Bookings',
      value: dashboardData.today.bookingsCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-primary">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Pending Approvals',
      value: dashboardData.today.pendingCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-secondary">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      ),
      trend: { value: 5, isPositive: false }
    },
    {
      title: 'Net Revenue',
      value: `${(dashboardData.today.revenue / 1000000).toFixed(1)}M`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-primary">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Total Members',
      value: dashboardData.members.total,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-secondary">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        </svg>
      ),
      trend: { value: 1.2, isPositive: true }
    },
  ] : [];

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
        <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">System <span className="text-primary italic">Overview</span></h1>
        <p className="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-widest">Real-time performance metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${stat.trend.isPositive ? 'bg-status-success-bg text-status-success-text' : 'bg-status-danger-bg text-status-danger-text'}`}>
                {stat.trend.isPositive ? '+' : '-'}{stat.trend.value}%
              </div>
            </div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.title}</div>
            <div className="text-2xl font-display font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-white/5">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Booking Volume
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyBookingsData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 700 }} 
                />
                <Tooltip
                  cursor={{ fill: 'rgba(204,255,0,0.02)' }}
                  contentStyle={{
                    backgroundColor: '#121214',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#FFF'
                  }}
                />
                <Bar dataKey="bookings" fill="#ccff00" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 border-white/5">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Source Breakdown
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#ccff00" />
                  <Cell fill="#00e5ff" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121214',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Activity</h3>
          <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Audit Logs</button>
        </div>
        <div className="overflow-x-auto">
          <Table headers={['Reference', 'Customer', 'Details', 'Time', 'Status', 'Total']}>
            {dashboardData?.recentBookings?.slice(0, 8).map((booking) => (
              <TableRow key={booking.id} className="hover:bg-white/[0.02] border-white/5">
                <TableCell className="font-mono text-primary font-bold text-xs uppercase">#{booking.ref}</TableCell>
                <TableCell className="font-bold text-white">{booking.customerName}</TableCell>
                <TableCell className="text-gray-400 text-xs italic">
                  {booking.court?.name || `Arena 1`}
                </TableCell>
                <TableCell className="text-gray-500 font-bold text-[11px] uppercase">
                  {booking.bookingDate} · {booking.startTime}
                </TableCell>
                <TableCell>
                  <Badge status={booking.status} />
                </TableCell>
                <TableCell className="text-right font-black text-white">
                  {booking.finalPrice.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">VND</span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
}

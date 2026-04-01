import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../api/analytics';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { Table, TableRow, TableCell } from '../../components/Table';
import { format } from 'date-fns';

const BLUE_PALETTE = ['#0066FF', '#1D78FF', '#3A8AFF', '#579CFF', '#74AEFF'];

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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Approvals Required',
      value: dashboardData.today.pendingCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      ),
      trend: { value: 5, isPositive: false }
    },
    {
      title: 'Net Revenue',
      value: `${(dashboardData.today.revenue / 1000000).toFixed(1)}M`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Total Members',
      value: dashboardData.members.total,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
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
    <div className="max-w-[1400px] mx-auto">
      <header className="mb-6">
        <h1 className="text-[20px] font-semibold tracking-tight text-gray-900">Overview</h1>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Platform performance and operational metrics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Booking Volume (Last 7 Days)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyBookingsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 500 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 500 }} 
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,102,255,0.02)' }}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              />
              <Bar dataKey="bookings" fill="#0066FF" radius={[3, 3, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Source Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={bookingSourceData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {bookingSourceData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={BLUE_PALETTE[index % BLUE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white border border-border rounded-lg shadow-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-[12px] font-semibold text-gray-900 tracking-tight">Recent Transactions</h3>
          <button className="text-[11px] font-medium text-primary hover:underline">Full Audit Log</button>
        </div>
        <Table headers={['Ref', 'Member', 'Service Detail', 'Timestamp', 'Status', 'Total']}>
          {dashboardData?.recentBookings?.slice(0, 8).map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-semibold text-primary">{booking.ref}</TableCell>
              <TableCell className="font-medium">{booking.customerName}</TableCell>
              <TableCell className="text-gray-500 italic">
                {booking.court?.name || `Arena 1`}
              </TableCell>
              <TableCell className="text-gray-400 font-medium">
                {booking.bookingDate} · {booking.startTime}
              </TableCell>
              <TableCell>
                <Badge status={booking.status} />
              </TableCell>
              <TableCell className="text-right font-semibold">
                {booking.finalPrice.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">VND</span>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </div>
  );
}

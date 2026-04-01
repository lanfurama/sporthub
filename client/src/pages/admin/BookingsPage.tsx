import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import { bookingsApi } from '../../api/bookings';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { Table, TableRow, TableCell } from '../../components/Table';
import { format } from 'date-fns';

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'confirmed' | 'all'>('pending');
  const [dateFilter, setDateFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', 'admin', statusFilter, dateFilter],
    queryFn: () =>
      bookingsApi.list({
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(dateFilter ? { date: dateFilter } : {}),
        limit: 50,
      }),
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: 'confirmed' | 'rejected'; reason?: string }) =>
      bookingsApi.updateStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const handleConfirm = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'confirmed' });
  };

  const handleReject = (id: string) => {
    const reason = prompt('Specify rejection reason:');
    if (reason !== null) {
      updateStatusMutation.mutate({ id, status: 'rejected', reason: reason || undefined });
    }
  };

  const bookings = bookingsData?.data || [];
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">Court <span className="text-primary italic">Reservations</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-widest">Workflow approval & booking management</p>
        </div>
        {pendingCount > 0 && (
          <div className="px-4 h-9 flex items-center bg-primary/10 text-primary text-[11px] font-black rounded-xl border border-primary/20 shadow-neon">
            <Zap className="w-3.5 h-3.5 mr-2 fill-primary/20" />
            {pendingCount} Pending Approvals
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 border-white/5 flex items-center gap-4 shadow-2xl">
        <div className="w-[200px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-field h-11 text-xs font-bold appearance-none"
          >
            <option value="pending" className="bg-surface">Awaiting Approval</option>
            <option value="confirmed" className="bg-surface">Confirmed Entry</option>
            <option value="all" className="bg-surface">Master Log</option>
          </select>
        </div>
        <div className="w-[200px]">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field h-11 text-xs font-bold px-4"
          />
        </div>
        <button
          onClick={() => {
            setStatusFilter('all');
            setDateFilter('');
          }}
          className="h-11 px-4 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors ml-auto"
        >
          Reset Filters
        </button>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="glass-card p-20 flex justify-center border-white/5 shadow-2xl">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="glass-card border-white/5 overflow-hidden shadow-2xl">
          <Table
            headers={['Reference', 'Member Profile', 'Booking Intelligence', 'Investment', 'Status', 'Actions']}
          >
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-white/[0.02] border-white/5">
                <TableCell className="font-mono text-primary font-bold text-xs uppercase">#{booking.ref}</TableCell>
                <TableCell>
                  <div className="flex flex-col py-1">
                    <span className="font-bold text-white leading-tight">{booking.customerName}</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider mt-1">{booking.customerPhone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col py-1">
                    <span className="font-bold text-white leading-tight">
                      {booking.court?.name || `Arena 1`}
                    </span>
                    <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">
                      {format(new Date(booking.bookingDate), 'MMM dd')} · {booking.startTime}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-display font-black text-white whitespace-nowrap">
                  {booking.finalPrice.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal uppercase ml-1">vnd</span>
                </TableCell>
                <TableCell>
                  <Badge status={booking.status} />
                </TableCell>
                <TableCell>
                  {booking.status === 'pending' ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        disabled={updateStatusMutation.isPending}
                        className="h-8 px-4 text-[10px] font-black bg-primary text-background hover:bg-primary-hover rounded-lg shadow-neon transition-all uppercase tracking-widest"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        disabled={updateStatusMutation.isPending}
                        className="h-8 px-4 text-[10px] font-black text-gray-500 hover:text-accent hover:bg-accent/5 rounded-lg transition-all uppercase tracking-widest"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button className="h-8 px-4 text-[10px] font-black text-gray-500 hover:text-white hover:bg-white/5 border border-white/5 rounded-lg transition-all uppercase tracking-widest">
                      View Audit
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {bookings.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">No reservations found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

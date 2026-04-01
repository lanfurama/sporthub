import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-gray-900">Reservations</h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Manage court bookings and approval workflow.</p>
        </div>
        {pendingCount > 0 && (
          <div className="px-2 h-6 flex items-center bg-primary/10 text-primary text-[11px] font-bold rounded border border-primary/20">
            {pendingCount} Pending Approvals
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-border rounded-lg p-3 mb-4 shadow-card flex items-center gap-3">
        <div className="w-[160px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full h-9 text-[13px]"
          >
            <option value="pending">Awaiting Approval</option>
            <option value="confirmed">Confirmed</option>
            <option value="all">All Reservations</option>
          </select>
        </div>
        <div className="w-[180px]">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full h-9 text-[13px]"
          />
        </div>
        <button
          onClick={() => {
            setStatusFilter('all');
            setDateFilter('');
          }}
          className="h-9 px-3 text-[12px] font-medium text-gray-500 hover:text-gray-900 ml-auto"
        >
          Clear Filters
        </button>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="bg-white border border-border rounded-lg p-12 shadow-card flex justify-center">
          <Spinner size={28} />
        </div>
      ) : (
        <Table
          headers={['Ref ID', 'Member Profile', 'Booking Details', 'Total Amount', 'Status', 'Actions']}
        >
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-semibold text-primary">{booking.ref}</TableCell>
              <TableCell>
                <div className="flex flex-col py-0.5">
                  <span className="font-medium text-gray-900 leading-tight">{booking.customerName}</span>
                  <span className="text-[11px] text-gray-400 font-medium leading-tight">{booking.customerPhone}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col py-0.5">
                  <span className="font-medium text-gray-900 leading-tight">
                    {booking.court?.name || `Arena 1`}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium leading-tight italic">
                    {format(new Date(booking.bookingDate), 'MMM dd, yyyy')} · {booking.startTime}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-gray-900 whitespace-nowrap">
                {booking.finalPrice.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">VND</span>
              </TableCell>
              <TableCell>
                <Badge status={booking.status} />
              </TableCell>
              <TableCell>
                {booking.status === 'pending' ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleConfirm(booking.id)}
                      disabled={updateStatusMutation.isPending}
                      className="h-7 px-2.5 text-[11px] font-semibold bg-primary text-white hover:bg-primary-hover rounded shadow-sm flex items-center gap-1"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      disabled={updateStatusMutation.isPending}
                      className="h-7 px-2.5 text-[11px] font-medium text-status-danger-text hover:bg-status-danger-bg rounded transition-all"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <button className="h-7 px-2.5 text-[11px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-border rounded transition-all">
                    View Receipt
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {bookings.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-gray-400 italic">
                No reservations found for current filter.
              </TableCell>
            </TableRow>
          )}
        </Table>
      )}
    </div>
  );
}

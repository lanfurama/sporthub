'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lightning } from '@phosphor-icons/react';
import { bookingsApi } from '@/src/lib/api/bookings';
import Badge from '@/components/Badge';
import Spinner from '@/components/Spinner';
import { Table, TableRow, TableCell } from '@/components/Table';
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink tracking-tight">
            Court Reservations
          </h1>
          <p className="text-sm text-ink-muted mt-1.5">
            Workflow approval & booking management
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="px-3.5 h-9 flex items-center bg-accent-subtle text-accent text-xs font-semibold rounded-xl border border-accent/20">
            <Lightning size={14} weight="fill" className="mr-2" />
            {pendingCount} pending
          </div>
        )}
      </div>

      <div className="sport-card p-4 flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'pending' | 'confirmed' | 'all')}
          className="input-field h-11 text-sm w-[200px] appearance-none"
        >
          <option value="pending">Awaiting approval</option>
          <option value="confirmed">Confirmed</option>
          <option value="all">All bookings</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input-field h-11 text-sm w-[200px] px-4"
        />
        <button
          onClick={() => {
            setStatusFilter('all');
            setDateFilter('');
          }}
          className="h-11 px-4 text-sm font-semibold text-ink-muted hover:text-ink transition-colors ml-auto"
        >
          Reset
        </button>
      </div>

      {isLoading ? (
        <div className="sport-card p-20 flex justify-center">
          <Spinner size={32} className="text-primary" />
        </div>
      ) : (
        <div className="sport-card overflow-hidden">
          <Table headers={['Reference', 'Member', 'Court & Time', 'Total', 'Status', 'Actions']}>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono text-primary font-semibold text-xs">
                  #{booking.ref}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink">{booking.customerName}</span>
                    <span className="text-xs text-ink-subtle mt-0.5">{booking.customerPhone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink">
                      {booking.court?.name ?? '—'}
                    </span>
                    <span className="text-xs text-primary font-medium mt-0.5 tabular-nums">
                      {format(new Date(booking.bookingDate), 'MMM dd')} · {booking.startTime}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-ink tabular-nums whitespace-nowrap">
                  {booking.finalPrice.toLocaleString()}{' '}
                  <span className="text-[10px] text-ink-subtle font-normal ml-0.5">VND</span>
                </TableCell>
                <TableCell>
                  <Badge status={booking.status} />
                </TableCell>
                <TableCell>
                  {booking.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        disabled={updateStatusMutation.isPending}
                        className="h-8 px-3.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        disabled={updateStatusMutation.isPending}
                        className="h-8 px-3.5 text-xs font-semibold text-ink-muted hover:text-accent hover:bg-accent-subtle rounded-lg transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button className="h-8 px-3.5 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface-muted border border-border rounded-lg transition-all">
                      View
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {bookings.length === 0 && (
            <div className="py-16 text-center text-sm text-ink-subtle">
              No reservations found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

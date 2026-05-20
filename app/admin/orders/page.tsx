'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/src/lib/api/orders';
import { Table, TableRow, TableCell } from '@/components/Table';
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import Badge from '@/components/Badge';
import { format } from 'date-fns';

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', statusFilter, dateFrom, dateTo],
    queryFn: () =>
      ordersApi.list({
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        limit: 100,
      }),
  });

  const { data: orderDetail } = useQuery({
    queryKey: ['orders', selectedOrder],
    queryFn: () => (selectedOrder ? ordersApi.get(selectedOrder) : null),
    enabled: !!selectedOrder,
  });

  const orders = ordersData?.data || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink tracking-tight">
            Order History
          </h1>
          <p className="text-sm text-ink-muted mt-1.5">
            Transaction audit & revenue tracking
          </p>
        </div>
      </div>

      <div className="sport-card p-4 flex items-center gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field h-11 text-sm w-[180px] appearance-none"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-field h-11 text-sm px-4 w-[160px]"
          />
          <span className="text-xs text-ink-subtle font-medium">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-field h-11 text-sm px-4 w-[160px]"
          />
        </div>
        <button
          onClick={() => {
            setStatusFilter('');
            setDateFrom('');
            setDateTo('');
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
          <Table headers={['Order ref', 'Total', 'Status', 'Date', 'Actions']}>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-info">
                    #{order.id.slice(0, 8)}
                  </span>
                </TableCell>
                <TableCell className="font-semibold text-ink tabular-nums">
                  {order.total.toLocaleString()}{' '}
                  <span className="text-[10px] text-ink-subtle font-normal ml-0.5">VND</span>
                </TableCell>
                <TableCell>
                  <Badge status={order.status} />
                </TableCell>
                <TableCell className="text-ink-muted text-sm">
                  {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => setSelectedOrder(order.id)}
                    className="h-8 px-3.5 text-xs font-semibold text-info hover:bg-info-subtle border border-info/20 rounded-lg transition-all active:scale-[0.98]"
                  >
                    Details
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {orders.length === 0 && (
            <div className="py-16 text-center text-sm text-ink-subtle">
              No transactions
            </div>
          )}
        </div>
      )}

      <Modal
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        title="Order details"
        size="lg"
      >
        {orderDetail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-surface-muted rounded-2xl border border-border">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.08em]">Reference</div>
                <div className="font-mono text-sm font-semibold text-ink">#{orderDetail.id.slice(0, 12)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.08em]">Status</div>
                <Badge status={orderDetail.status} />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.08em]">Date</div>
                <div className="text-sm font-semibold text-ink">
                  {format(new Date(orderDetail.createdAt), 'MMM dd, HH:mm')}
                </div>
              </div>
              {orderDetail.payMethod && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.08em]">Method</div>
                  <div className="text-sm font-semibold text-info uppercase">{orderDetail.payMethod}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.12em] flex items-center gap-3">
                Line items
                <div className="h-px flex-1 bg-border" />
              </h4>
              {orderDetail.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink">Product #{item.productId}</div>
                    <div className="text-xs text-ink-subtle mt-0.5 tabular-nums">
                      {item.quantity} × {item.unitPrice.toLocaleString()} VND
                    </div>
                  </div>
                  <div className="text-base font-semibold text-ink tabular-nums">
                    {item.subtotal.toLocaleString()}{' '}
                    <span className="text-[10px] font-normal text-ink-subtle">VND</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-5 border-t border-border">
              <div className="space-y-2.5 max-w-[320px] ml-auto">
                <div className="flex justify-between text-sm text-ink-muted">
                  <span>Subtotal</span>
                  <span className="text-ink tabular-nums">{orderDetail.subtotal.toLocaleString()} VND</span>
                </div>
                {orderDetail.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-status-success-text">
                    <span>Discount</span>
                    <span className="tabular-nums">-{orderDetail.discountAmount.toLocaleString()} VND</span>
                  </div>
                )}
                {orderDetail.creditUsed > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Credit applied</span>
                    <span className="tabular-nums">-{orderDetail.creditUsed.toLocaleString()} VND</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-display font-bold pt-3 border-t border-border mt-1">
                  <span className="text-ink">Total</span>
                  <span className="text-primary tabular-nums">{orderDetail.total.toLocaleString()} VND</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

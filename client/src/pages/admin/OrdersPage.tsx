import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';
import { Table, TableRow, TableCell } from '../../components/Table';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
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
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">Order <span className="text-secondary italic">History</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-widest">Transaction audit & revenue tracking</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 border-white/5 flex items-center gap-4 shadow-2xl">
        <div className="w-[180px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field h-11 text-xs font-bold appearance-none"
          >
            <option value="" className="bg-surface">All Statuses</option>
            <option value="pending" className="bg-surface text-status-warning-text">Pending</option>
            <option value="completed" className="bg-surface text-status-success-text">Completed</option>
            <option value="cancelled" className="bg-surface text-status-danger-text">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-field h-11 text-xs font-bold px-4 w-[160px]"
          />
          <span className="text-gray-600 font-black text-[10px] uppercase tracking-widest">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-field h-11 text-xs font-bold px-4 w-[160px]"
          />
        </div>
        <button
          onClick={() => {
            setStatusFilter('');
            setDateFrom('');
            setDateTo('');
          }}
          className="h-11 px-4 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors ml-auto"
        >
          Clear Filters
        </button>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="glass-card p-20 flex justify-center border-white/5 shadow-2xl">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="glass-card border-white/5 overflow-hidden shadow-2xl">
          <Table headers={['Order Ref', 'Total Value', 'Status', 'Timestamp', 'Actions']}>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-white/[0.02] border-white/5">
                <TableCell>
                  <span className="font-mono text-xs font-bold text-secondary uppercase tracking-wider">#{order.id.slice(0, 8)}</span>
                </TableCell>
                <TableCell className="font-display font-black text-white">
                  {order.total.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal uppercase ml-1">vnd</span>
                </TableCell>
                <TableCell>
                  <Badge status={order.status} />
                </TableCell>
                <TableCell className="text-gray-400 font-bold text-[12px]">
                  {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => setSelectedOrder(order.id)}
                    className="h-8 px-4 text-[10px] font-black text-secondary hover:bg-secondary/10 border border-secondary/20 rounded-lg transition-all uppercase tracking-widest"
                  >
                    Details
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {orders.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">No transactions recorded</p>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        title="Transaction Intelligence"
        size="lg"
        isDark={true}
      >
        {orderDetail && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white/[0.03] rounded-2xl border border-white/5 shadow-inner">
              <div className="space-y-1">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Reference ID</div>
                <div className="font-mono text-xs font-black text-white uppercase">#{orderDetail.id.slice(0, 12)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Status</div>
                <Badge status={orderDetail.status} />
              </div>
              <div className="space-y-1">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Timestamp</div>
                <div className="text-xs font-bold text-white uppercase">
                  {format(new Date(orderDetail.createdAt), 'MMM dd, HH:mm')}
                </div>
              </div>
              {orderDetail.payMethod && (
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Method</div>
                  <div className="text-xs font-bold text-secondary uppercase tracking-wider">{orderDetail.payMethod}</div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-3">
                Commercial Line Items
                <div className="h-px flex-1 bg-white/5" />
              </h4>
              <div className="space-y-3">
                {orderDetail.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-white/5 group hover:border-white/10 transition-all"
                  >
                    <div>
                      <div className="text-[13px] font-bold text-white">Stock Asset #{item.productId}</div>
                      <div className="text-[10px] text-gray-500 font-black uppercase mt-1">
                        {item.quantity} units × {item.unitPrice.toLocaleString()} VND
                      </div>
                    </div>
                    <div className="text-[15px] font-display font-black text-white">
                      {item.subtotal.toLocaleString()} <span className="text-[9px] font-normal text-gray-500 uppercase">vnd</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="space-y-3 max-w-[320px] ml-auto">
                <div className="flex justify-between text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                  <span>Gross Subtotal</span>
                  <span className="text-white">{orderDetail.subtotal.toLocaleString()} VND</span>
                </div>
                {orderDetail.discountAmount > 0 && (
                  <div className="flex justify-between text-[12px] font-bold text-status-success-text uppercase tracking-tight">
                    <span>Campaign Discount</span>
                    <span>-{orderDetail.discountAmount.toLocaleString()} VND</span>
                  </div>
                )}
                {orderDetail.creditUsed > 0 && (
                  <div className="flex justify-between text-[12px] font-bold text-primary uppercase tracking-tight">
                    <span>Member Credit applied</span>
                    <span>-{orderDetail.creditUsed.toLocaleString()} VND</span>
                  </div>
                )}
                <div className="flex justify-between text-[18px] font-display font-black pt-4 border-t border-white/5 mt-2">
                  <span className="text-white uppercase tracking-tighter">Total Amount</span>
                  <span className="text-secondary shadow-secondary/10">{orderDetail.total.toLocaleString()} VND</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

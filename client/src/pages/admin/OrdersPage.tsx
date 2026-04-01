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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-base">Quản lý đơn hàng</h1>
        <p className="text-sm text-muted mt-1">Danh sách đơn hàng shop</p>
      </div>

      {/* Filters */}
      <div className="bg-bg-card border border-border-dark rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-base mb-2">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-base mb-2">Từ ngày</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-base mb-2">Đến ngày</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('');
                setDateFrom('');
                setDateTo('');
              }}
              className="w-full px-4 py-2 rounded-lg border border-border-dark text-muted hover:text-text-base hover:border-muted text-sm transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={36} />
        </div>
      ) : (
        <Table headers={['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Ngày', 'Thao tác']}>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <span className="font-mono text-sm text-text-base">{order.id.slice(0, 8)}...</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted">-</span>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-text-base">
                  {order.total.toLocaleString()} VND
                </span>
              </TableCell>
              <TableCell>
                <Badge status={order.status} />
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted">
                  {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                </span>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => setSelectedOrder(order.id)}
                  className="text-xs text-indigo hover:text-indigo/80"
                >
                  Xem chi tiết
                </button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Order Detail Modal */}
      <Modal
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        title="Chi tiết đơn hàng"
        size="lg"
      >
        {orderDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted mb-1">Mã đơn</div>
                <div className="font-mono text-sm text-text-base">{orderDetail.id}</div>
              </div>
              <div>
                <div className="text-xs text-muted mb-1">Trạng thái</div>
                <Badge status={orderDetail.status} />
              </div>
              <div>
                <div className="text-xs text-muted mb-1">Ngày tạo</div>
                <div className="text-sm text-text-base">
                  {format(new Date(orderDetail.createdAt), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
              {orderDetail.payMethod && (
                <div>
                  <div className="text-xs text-muted mb-1">Phương thức thanh toán</div>
                  <div className="text-sm text-text-base">{orderDetail.payMethod}</div>
                </div>
              )}
            </div>

            <div className="border-t border-border-dark pt-4">
              <h4 className="text-sm font-semibold text-text-base mb-3">Sản phẩm</h4>
              <div className="space-y-2">
                {orderDetail.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-bg-deep rounded-lg"
                  >
                    <div>
                      <div className="text-sm text-text-base">Product {item.productId}</div>
                      <div className="text-xs text-muted">
                        {item.quantity} × {item.unitPrice.toLocaleString()} VND
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-text-base">
                      {item.subtotal.toLocaleString()} VND
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border-dark pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tạm tính</span>
                  <span className="text-text-base">{orderDetail.subtotal.toLocaleString()} VND</span>
                </div>
                {orderDetail.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green">Giảm giá</span>
                    <span className="text-green">-{orderDetail.discountAmount.toLocaleString()} VND</span>
                  </div>
                )}
                {orderDetail.creditUsed > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green">Credit đã dùng</span>
                    <span className="text-green">-{orderDetail.creditUsed.toLocaleString()} VND</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-border-dark">
                  <span className="text-text-base">Tổng cộng</span>
                  <span className="text-indigo">{orderDetail.total.toLocaleString()} VND</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

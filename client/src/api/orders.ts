import apiClient from './client';
import type { Order } from '../types';

export const ordersApi = {
  async create(data: {
    items: Array<{ productId: string; quantity: number }>;
    memberId?: string;
    useCredit?: boolean;
    payMethod?: string;
  }): Promise<any> {
    const res = await apiClient.post('/orders', data);
    return res.data;
  },

  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: Order[]; meta: any }> {
    const res = await apiClient.get('/orders', { params });
    return res.data;
  },

  async get(id: string): Promise<Order> {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data.data;
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    const res = await apiClient.patch(`/orders/${id}/status`, { status });
    return res.data.data;
  },
};

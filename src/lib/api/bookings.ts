import apiClient from '@/src/lib/api-client';
import type { Booking } from '@/src/types';

export const bookingsApi = {
  async create(data: {
    courtId: number;
    date: string;
    time: string;
    duration: number;
    customer: { name: string; phone: string; email?: string };
    memberId?: string;
    useCredit?: boolean;
    creditAmount?: number;
    useGuestPass?: boolean;
    note?: string;
  }): Promise<{
    id: string;
    ref: string;
    status: string;
    courtName: string;
    date: string;
    time: string;
    duration: number;
    pricing: {
      basePrice: number;
      discountAmount: number;
      creditUsed: number;
      finalPrice: number;
    };
    createdAt: string;
  }> {
    const res = await apiClient.post('/bookings', data);
    return res.data.data;
  },

  async list(params?: {
    status?: string;
    date?: string;
    source?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Booking[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const res = await apiClient.get('/bookings', { params });
    return res.data;
  },

  async get(id: string): Promise<Booking> {
    const res = await apiClient.get(`/bookings/${id}`);
    return res.data.data;
  },

  async cancel(id: string): Promise<{ refunded: number; refundType: string }> {
    const res = await apiClient.delete(`/bookings/${id}`);
    return res.data.data;
  },
};

import apiClient from './client';
import type { Booking } from '../types';

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
  }): Promise<any> {
    const res = await apiClient.post('/bookings', data);
    return res.data;
  },

  async createAdmin(data: {
    courtId: number;
    date: string;
    time: string;
    duration: number;
    customer: { name: string; phone: string; email?: string };
    memberId?: string;
    useCredit?: boolean;
    creditAmount?: number;
    payMethod: string;
    note?: string;
  }): Promise<any> {
    const res = await apiClient.post('/bookings/admin', data);
    return res.data;
  },

  async list(params?: {
    status?: string;
    date?: string;
    source?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Booking[]; meta: any }> {
    const res = await apiClient.get('/bookings', { params });
    return res.data;
  },

  async updateStatus(
    id: string,
    status: 'confirmed' | 'rejected' | 'completed',
    reason?: string,
  ): Promise<any> {
    const res = await apiClient.patch(`/bookings/${id}/status`, { status, reason });
    return res.data;
  },

  async cancel(id: string): Promise<any> {
    const res = await apiClient.delete(`/bookings/${id}`);
    return res.data;
  },
};

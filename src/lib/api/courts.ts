import apiClient from '@/src/lib/api-client';
import type { Court } from '@/src/types';

export const courtsApi = {
  async list(params?: {
    sport?: string;
    date?: string;
    time?: string;
    duration?: number;
  }): Promise<Court[]> {
    const res = await apiClient.get('/courts', { params });
    return res.data.data;
  },

  async getById(id: number): Promise<Court> {
    const res = await apiClient.get(`/courts/${id}`);
    return res.data.data;
  },

  async getAvailability(
    id: number,
    date: string,
  ): Promise<{ date: string; slots: Array<{ time: string; available: boolean; isPeak: boolean; price: number }> }> {
    const res = await apiClient.get(`/courts/${id}/availability`, {
      params: { date },
    });
    return res.data.data;
  },
};

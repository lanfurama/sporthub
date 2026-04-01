import apiClient from './client';
import type { Member } from '../types';

export const membersApi = {
  async list(params?: {
    plan?: string;
    search?: string;
    expiringSoon?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Member[]; meta: any }> {
    const res = await apiClient.get('/members', { params });
    return res.data;
  },

  async get(id: string): Promise<Member> {
    const res = await apiClient.get(`/members/${id}`);
    return res.data.data;
  },

  async create(data: {
    name: string;
    phone: string;
    email?: string;
    plan: string;
  }): Promise<Member> {
    const res = await apiClient.post('/members', data);
    return res.data.data;
  },

  async addCredit(id: string, amount: number, reason?: string): Promise<any> {
    const res = await apiClient.post(`/members/${id}/credit`, { amount, reason });
    return res.data;
  },
};

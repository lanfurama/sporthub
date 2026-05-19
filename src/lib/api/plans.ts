import apiClient from '@/src/lib/api-client';
import type { Plan } from '@/src/types';

export const plansApi = {
  async list(): Promise<Plan[]> {
    const res = await apiClient.get('/plans');
    return res.data.data;
  },
};

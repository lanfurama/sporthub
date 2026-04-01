import apiClient from './client';
import type { Plan } from '../types';

export const plansApi = {
  async list(): Promise<Plan[]> {
    const res = await apiClient.get('/plans');
    return res.data.data;
  },
};

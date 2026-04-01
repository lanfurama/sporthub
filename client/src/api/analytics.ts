import apiClient from './client';
import type { DashboardData } from '../types';

export const analyticsApi = {
  async dashboard(): Promise<DashboardData> {
    const res = await apiClient.get('/analytics/dashboard');
    return res.data.data;
  },
};

import apiClient from '@/src/lib/api-client';
import type { DashboardData } from '@/src/types';

export const analyticsApi = {
  async dashboard(): Promise<DashboardData> {
    const res = await apiClient.get('/analytics/dashboard');
    return res.data.data;
  },
};

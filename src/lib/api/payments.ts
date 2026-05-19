import apiClient from '@/src/lib/api-client';

export const paymentsApi = {
  async create(data: {
    type: 'booking' | 'order';
    referenceId: string;
    amount: number;
    paymentMethod: 'vnpay' | 'momo';
  }): Promise<{ paymentUrl: string }> {
    const res = await apiClient.post('/payments', data);
    return res.data.data;
  },
};

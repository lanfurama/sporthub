import apiClient from './client';
import type { User } from '../types';

export const authApi = {
  async login(identifier: string, password: string): Promise<{ token: string; user: User }> {
    const res = await apiClient.post('/auth/login', { identifier, password });
    const { user, tokens } = res.data.data;
    return { token: tokens.accessToken, user };
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ token: string; user: User }> {
    const res = await apiClient.post('/auth/register', data);
    const { user, tokens } = res.data.data;
    return { token: tokens.accessToken, user };
  },
};

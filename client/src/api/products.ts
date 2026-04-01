import apiClient from './client';
import type { Product } from '../types';

export const productsApi = {
  async list(): Promise<Product[]> {
    const res = await apiClient.get('/products');
    return res.data.data;
  },

  async get(id: number): Promise<Product> {
    const res = await apiClient.get(`/products/${id}`);
    return res.data.data;
  },

  async create(data: {
    name: string;
    category?: string;
    price: number;
    stock?: number;
    isService?: boolean;
  }): Promise<Product> {
    const res = await apiClient.post('/products', data);
    return res.data.data;
  },

  async update(id: number, data: Partial<Product>): Promise<Product> {
    const res = await apiClient.patch(`/products/${id}`, data);
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};

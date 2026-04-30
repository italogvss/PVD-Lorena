import api from '../lib/axios';
import type { Product, PaginatedResponse, CreateProductRequest, UpdateProductRequest } from '../types';

export interface GetProductsParams {
  page: number;
  pageSize: number;
  name?: string;
  barcode?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const productService = {
  getAll: (params: GetProductsParams) =>
    api.get<PaginatedResponse<Product>>('/api/products', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Product>(`/api/products/${id}`).then(r => r.data),

  create: (data: CreateProductRequest) =>
    api.post<Product>('/api/products', data).then(r => r.data),

  update: (id: string, data: UpdateProductRequest) =>
    api.put<Product>(`/api/products/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/api/products/${id}`),

  adjustStock: (id: string, quantity: number) =>
    api.patch(`/api/products/${id}/stock`, { quantity }),
};

export default productService;

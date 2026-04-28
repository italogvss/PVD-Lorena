import api from '../lib/axios';
import type { Sale, SaleDetail, PaginatedResponse, CreateSaleRequest, SaleStatus } from '../types';

export interface GetSalesParams {
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  operatorId?: string;
  status?: SaleStatus;
}

const saleService = {
  getAll: (params: GetSalesParams) =>
    api.get<PaginatedResponse<Sale>>('/api/sales', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<SaleDetail>(`/api/sales/${id}`).then(r => r.data),

  create: (data: CreateSaleRequest) =>
    api.post<SaleDetail>('/api/sales', data).then(r => r.data),

  cancel: (id: string) =>
    api.delete(`/api/sales/${id}`),
};

export default saleService;

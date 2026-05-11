import api from '../lib/axios';
import type { Expense, ExpenseChartPoint, CreateExpenseRequest, UpdateExpenseRequest, PaginatedResponse } from '../types';
import type { ChartGroupBy } from './reportService';

interface GetExpensesParams {
  page: number;
  pageSize: number;
  month?: number;
  year?: number;
  isPaid?: boolean;
}

const expenseService = {
  getChart: (params: { startDate: string; endDate: string; groupBy: ChartGroupBy }) =>
    api.get<ExpenseChartPoint[]>('/api/expenses/chart', { params }).then(r => r.data),

  getAll: (params: GetExpensesParams) =>
    api.get<PaginatedResponse<Expense>>('/api/expenses', { params }).then(r => r.data),

  getRecurring: () =>
    api.get<Expense[]>('/api/expenses/recurring').then(r => r.data),

  getById: (id: string) =>
    api.get<Expense>(`/api/expenses/${id}`).then(r => r.data),

  create: (data: CreateExpenseRequest) =>
    api.post<Expense>('/api/expenses', data).then(r => r.data),

  update: (id: string, data: UpdateExpenseRequest) =>
    api.put<Expense>(`/api/expenses/${id}`, data).then(r => r.data),

  markAsPaid: (id: string) =>
    api.patch<Expense>(`/api/expenses/${id}/pay`).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/api/expenses/${id}`),
};

export default expenseService;

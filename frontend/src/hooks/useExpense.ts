import { useState } from 'react';
import expenseService from '../services/expenseService';
import type { ChartGroupBy } from '../services/reportService';
import type { CreateExpenseRequest, UpdateExpenseRequest } from '../types';

type LoadingState = 'fetch' | 'fetchRecurring' | 'fetchChart' | 'fetchOne' | 'create' | 'update' | 'pay' | 'remove' | null;

interface GetExpensesParams {
  page: number;
  pageSize: number;
  month?: number;
  year?: number;
  isPaid?: boolean;
}

export function useExpense() {
  const [loading, setLoading] = useState<LoadingState>(null);

  const getAll = async (params: GetExpensesParams) => {
    setLoading('fetch');
    try {
      return await expenseService.getAll(params);
    } finally {
      setLoading(null);
    }
  };

  const getRecurring = async () => {
    setLoading('fetchRecurring');
    try {
      return await expenseService.getRecurring();
    } finally {
      setLoading(null);
    }
  };

  const getChart = async (params: { startDate: string; endDate: string; groupBy: ChartGroupBy }) => {
    setLoading('fetchChart');
    try {
      return await expenseService.getChart(params);
    } finally {
      setLoading(null);
    }
  };

  const getById = async (id: string) => {
    setLoading('fetchOne');
    try {
      return await expenseService.getById(id);
    } finally {
      setLoading(null);
    }
  };

  const create = async (data: CreateExpenseRequest) => {
    setLoading('create');
    try {
      return await expenseService.create(data);
    } finally {
      setLoading(null);
    }
  };

  const update = async (id: string, data: UpdateExpenseRequest) => {
    setLoading('update');
    try {
      return await expenseService.update(id, data);
    } finally {
      setLoading(null);
    }
  };

  const markAsPaid = async (id: string) => {
    setLoading('pay');
    try {
      return await expenseService.markAsPaid(id);
    } finally {
      setLoading(null);
    }
  };

  const remove = async (id: string) => {
    setLoading('remove');
    try {
      return await expenseService.remove(id);
    } finally {
      setLoading(null);
    }
  };

  return { loading, getAll, getRecurring, getChart, getById, create, update, markAsPaid, remove };
}

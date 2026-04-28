import { useState } from 'react';
import saleService, { GetSalesParams } from '../services/saleService';
import type { CreateSaleRequest } from '../types';

type LoadingState = 'fetch' | 'fetchOne' | 'create' | 'cancel' | null;

export function useSale() {
  const [loading, setLoading] = useState<LoadingState>(null);

  const getAll = async (params: GetSalesParams) => {
    setLoading('fetch');
    try {
      return await saleService.getAll(params);
    } finally {
      setLoading(null);
    }
  };

  const getById = async (id: string) => {
    setLoading('fetchOne');
    try {
      return await saleService.getById(id);
    } finally {
      setLoading(null);
    }
  };

  const create = async (data: CreateSaleRequest) => {
    setLoading('create');
    try {
      return await saleService.create(data);
    } finally {
      setLoading(null);
    }
  };

  const cancel = async (id: string) => {
    setLoading('cancel');
    try {
      return await saleService.cancel(id);
    } finally {
      setLoading(null);
    }
  };

  return { loading, getAll, getById, create, cancel };
}

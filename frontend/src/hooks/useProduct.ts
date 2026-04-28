import { useState } from 'react';
import productService, { GetProductsParams } from '../services/productService';
import type { CreateProductRequest, UpdateProductRequest } from '../types';

type LoadingState = 'fetch' | 'fetchOne' | 'create' | 'update' | 'remove' | 'adjustStock' | null;

export function useProduct() {
  const [loading, setLoading] = useState<LoadingState>(null);

  const getAll = async (params: GetProductsParams) => {
    setLoading('fetch');
    try {
      return await productService.getAll(params);
    } finally {
      setLoading(null);
    }
  };

  const getById = async (id: string) => {
    setLoading('fetchOne');
    try {
      return await productService.getById(id);
    } finally {
      setLoading(null);
    }
  };

  const create = async (data: CreateProductRequest) => {
    setLoading('create');
    try {
      return await productService.create(data);
    } finally {
      setLoading(null);
    }
  };

  const update = async (id: string, data: UpdateProductRequest) => {
    setLoading('update');
    try {
      return await productService.update(id, data);
    } finally {
      setLoading(null);
    }
  };

  const remove = async (id: string) => {
    setLoading('remove');
    try {
      return await productService.remove(id);
    } finally {
      setLoading(null);
    }
  };

  const adjustStock = async (id: string, quantity: number) => {
    setLoading('adjustStock');
    try {
      return await productService.adjustStock(id, quantity);
    } finally {
      setLoading(null);
    }
  };

  return { loading, getAll, getById, create, update, remove, adjustStock };
}

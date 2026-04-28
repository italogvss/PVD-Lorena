import { useState } from 'react';
import userService, { GetUsersParams } from '../services/userService';
import type { CreateUserRequest, UpdateUserRequest } from '../types';

type LoadingState = 'fetch' | 'fetchOne' | 'create' | 'update' | 'remove' | 'resetPassword' | null;

export function useUser() {
  const [loading, setLoading] = useState<LoadingState>(null);

  const getAll = async (params: GetUsersParams) => {
    setLoading('fetch');
    try {
      return await userService.getAll(params);
    } finally {
      setLoading(null);
    }
  };

  const getById = async (id: string) => {
    setLoading('fetchOne');
    try {
      return await userService.getById(id);
    } finally {
      setLoading(null);
    }
  };

  const create = async (data: CreateUserRequest) => {
    setLoading('create');
    try {
      return await userService.create(data);
    } finally {
      setLoading(null);
    }
  };

  const update = async (id: string, data: UpdateUserRequest) => {
    setLoading('update');
    try {
      return await userService.update(id, data);
    } finally {
      setLoading(null);
    }
  };

  const remove = async (id: string) => {
    setLoading('remove');
    try {
      return await userService.remove(id);
    } finally {
      setLoading(null);
    }
  };

  const resetPassword = async (id: string, newPassword: string) => {
    setLoading('resetPassword');
    try {
      return await userService.resetPassword(id, newPassword);
    } finally {
      setLoading(null);
    }
  };

  return { loading, getAll, getById, create, update, remove, resetPassword };
}

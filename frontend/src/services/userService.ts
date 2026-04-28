import api from '../lib/axios';
import type { User, PaginatedResponse, CreateUserRequest, UpdateUserRequest } from '../types';

export interface GetUsersParams {
  page: number;
  pageSize: number;
}

const userService = {
  getAll: (params: GetUsersParams) =>
    api.get<PaginatedResponse<User>>('/api/users', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<User>(`/api/users/${id}`).then(r => r.data),

  create: (data: CreateUserRequest) =>
    api.post<User>('/api/users', data).then(r => r.data),

  update: (id: string, data: UpdateUserRequest) =>
    api.put<User>(`/api/users/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/api/users/${id}`),

  resetPassword: (id: string, newPassword: string) =>
    api.put(`/api/users/${id}/password`, { newPassword }),
};

export default userService;

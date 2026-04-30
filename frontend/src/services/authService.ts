import api from '../lib/axios';
import type { AuthUser } from '../types';

interface LoginRequest {
  username: string;
  password: string;
}

const authService = {
  login: (data: LoginRequest) =>
    api.post('/api/auth/login', data).then(r => r.data),

  logout: () =>
    api.post('/api/auth/logout').then(r => r.data),

  me: () =>
    api.get<AuthUser>('/api/auth/me').then(r => r.data),
};

export default authService;

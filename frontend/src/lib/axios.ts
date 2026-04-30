import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    // Only redirect on 401 when outside the login page to avoid an infinite
    // reload loop caused by the initial session check (GET /api/auth/me).
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

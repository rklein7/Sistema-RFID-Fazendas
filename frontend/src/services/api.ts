import axios, { AxiosError } from 'axios';
import { LoginRequest, LoginResponse, RegisterRequest, DashboardStats, Leitura } from '../types';
import { getToken, removeToken } from '../utils/auth';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de Autenticação
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<{ message: string; username: string }> => {
    const response = await api.post('/usuarios', userData);
    return response.data;
  },
};

// Serviços de Dashboard
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard');
    return response.data;
  },

  getLeituras: async (params?: { zona?: number; tipo_animal?: string }): Promise<Leitura[]> => {
    const response = await api.get<Leitura[]>('/leituras', { params });
    return response.data;
  },

  getEstatisticasZona: async (zonaId: number) => {
    const response = await api.get(`/estatisticas/zona/${zonaId}`);
    return response.data;
  },
};

export default api;
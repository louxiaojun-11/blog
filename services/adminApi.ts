import axios from 'axios';
import { Admin } from '@/types/admin';
import Cookies from 'js-cookie';

const adminApi = axios.create({
  baseURL: 'http://localhost:8080/manage'
});

// 请求拦截器
adminApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('admin');
      sessionStorage.removeItem('adminToken');
      Cookies.remove('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  login: async (account: string, password: string) => {
    try {
      const response = await adminApi.post('/admin/login', { account, password });
      return response.data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }
}; 
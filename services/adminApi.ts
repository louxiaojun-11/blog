import axios, { AxiosRequestHeaders } from 'axios';
import { Admin } from '@/types/admin';
import Cookies from 'js-cookie';

const adminApi = axios.create({
  baseURL: 'http://localhost:8080/manage'
});

// 请求拦截器
adminApi.interceptors.request.use(
  (config) => {
    // 从 sessionStorage 获取 token
    const token = sessionStorage.getItem('token');
    
    // 如果有 token，添加到请求头
    if (token) {
      // 设置 token 到请求头
      config.headers = config.headers || {};
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
      // token 失效，清除所有登录状态
      sessionStorage.removeItem('admin');
      sessionStorage.removeItem('token');
      Cookies.remove('token');
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
  },

  getUserList: async (page: number, pageSize: number, key: string | null, timeOrder: boolean) => {
    try {
      const response = await adminApi.get('/user/userList', {
        params: {
          page,
          pageSize,
          key: key || null,
          timeOrder
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get user list error:', error);
      throw error;
    }
  },

  getUserBlogList: async (userId: number, page: number, pageSize: number) => {
    try {
      const response = await adminApi.get('/user/userBlogList', {
        params: {
          userId,
          page,
          pageSize
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get user blog list error:', error);
      throw error;
    }
  },

  getUserBlogDetail: async (blogId: number) => {
    try {
      const response = await adminApi.get('/user/userBlogDetail', {
        params: { blogId }
      });
      return response.data;
    } catch (error) {
      console.error('Get blog detail error:', error);
      throw error;
    }
  }
}; 
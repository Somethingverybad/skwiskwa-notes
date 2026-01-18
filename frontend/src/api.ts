import axios from 'axios';
import { Page, Block } from './types';

const API_URL = '/api';

// Настройка axios для автоматической отправки токена
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor для добавления токена к каждому запросу
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обновления токена при 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Не перенаправляем на /login для публичных страниц
    const isPublicPath = originalRequest.url?.includes('/public/share/');
    if (isPublicPath) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axiosInstance.post('/auth/token/refresh/', {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Не перенаправляем, если это публичный путь или если мы уже на странице /login или /register
        if (!window.location.pathname.startsWith('/share/') && 
            !window.location.pathname.startsWith('/login') && 
            !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  login: (username: string, password: string) =>
    axiosInstance.post('/auth/login/', { username, password }),
  
  register: (username: string, email: string, password: string, password2: string) =>
    axiosInstance.post('/auth/register/', { username, email, password, password2 }),
  
  logout: (refreshToken: string) =>
    axiosInstance.post('/auth/logout/', { refresh: refreshToken }),
  
  getMe: () => axiosInstance.get('/auth/me/'),
  
  // Pages
  getPages: () => axiosInstance.get<Page[]>('/pages/'),
  getPage: (id: number) => axiosInstance.get<Page>(`/pages/${id}/`),
  createPage: (data: Partial<Page>) => axiosInstance.post<Page>('/pages/', data),
  updatePage: (id: number, data: Partial<Page>) => axiosInstance.patch<Page>(`/pages/${id}/`, data),
  deletePage: (id: number) => axiosInstance.delete(`/pages/${id}/`),
  toggleSharePage: (id: number) => axiosInstance.post<Page>(`/pages/${id}/toggle_share/`),
  generateShareLink: (id: number) => axiosInstance.post<{share_token: string; share_url: string}>(`/pages/${id}/generate_share_link/`),
  getPublicPage: (token: string) => {
    // Для публичных страниц не требуется токен
    return axios.get<Page>(`${API_URL}/public/share/${token}/`);
  },
  getPublicBlocks: (token: string) => {
    // Для публичных блоков не требуется токен
    return axios.get<Block[]>(`${API_URL}/public/share/${token}/blocks/`);
  },
  
  // Blocks
  getBlocks: (pageId: number) => axiosInstance.get<Block[]>(`/blocks/?page=${pageId}`),
  createBlock: (data: Partial<Block>) => axiosInstance.post<Block>('/blocks/', data),
  updateBlock: (id: number, data: Partial<Block>) => axiosInstance.patch<Block>(`/blocks/${id}/`, data),
  deleteBlock: (id: number) => axiosInstance.delete(`/blocks/${id}/`),
  reorderBlocks: (blocks: { id: number; order: number }[]) => 
    axiosInstance.post('/blocks/reorder/', { blocks }),
  
  // File upload
  uploadFile: (blockId: number, file: File, onUploadProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<Block>(`/blocks/${blockId}/upload_file/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
  },
};

import axios from 'axios';
import store from '@/store';
import router from '@/router';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Her istekte token'ı ekle
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getters['auth/token'];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatalarında login sayfasına yönlendir
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Logout endpoint'ine yapılan isteklerde 401 hatası alırsak döngüye girmesin
    const isLogoutRequest = error.config && error.config.url && error.config.url.includes('/auth/logout');
    
    if (error.response && error.response.status === 401 && !isLogoutRequest) {
      // Token geçersiz veya süresi dolmuş
      // Store'u temizle ve login sayfasına yönlendir
      store.commit('auth/CLEAR_AUTH');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
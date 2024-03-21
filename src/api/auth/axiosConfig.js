import axios from 'axios';
import { useErrorStore } from '@/store/errors.js';

const baseUrl =
  import.meta.env['VITE_APP_BASE_URL'] +
  import.meta.env['VITE_APP_UAA_DRAGON_PATH'];

const axiosInstance = axios.create({
  // You can add your headers here
  // ================================
  baseURL: baseUrl,
  // timeout: 1000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  // You can modified config here
  return config;
});

// ℹ️ Add response interceptor to handle 401 response
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if ([500, 404].includes(error?.response?.status)) {
      const errorStore = useErrorStore();
      errorStore.setErrors();
      return Promise.reject(error);
    }

    // Handle error
    return Promise.reject(error);
  },
);

export default axiosInstance;

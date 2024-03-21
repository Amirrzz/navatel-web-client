import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import axios from 'axios';
import { useUserStore } from '@/store/user/user.js';
import { useErrorStore } from '@/store/errors.js';

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

const baseUrl =
  import.meta.env['VITE_APP_BASE_URL'] +
  import.meta.env['VITE_APP_UAA_DRAGON_PATH'];

const axiosInstance = axios.create({
  // You can add your headers here
  // ================================
  baseURL: baseUrl,
  // timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const userStore = useUserStore();
  // Retrieve token from userStore
  const token = userStore.token;
  const sessionToken = userStore.sessionToken;
  config.params = { t: sessionToken };
  config.headers = config.headers || {};

  // Return modified config
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

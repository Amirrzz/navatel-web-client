import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import axios from 'axios';
import router from '@/router/index.js';
import { useUserStore } from '@/store/user/user.js';
import { useErrorStore } from '@/store/errors.js';

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

const baseUrl =
  import.meta.env['VITE_APP_BASE_URL'] + import.meta.env['VITE_APP_CDR_PATH'];
const axiosIns = axios.create({
  // You can add your headers here
  // ================================
  baseURL: baseUrl,
  // timeout: 1000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});
// ℹ️ Add request interceptor to send the authorization header on each subsequent request after login
axiosIns.interceptors.request.use((config) => {
  // Retrieve token from localStorage
  const userStore = useUserStore();
  // Retrieve token from userStore
  const token = userStore.token; // If token is found
  if (token) {
    // Get request headers and if headers is undefined assign blank object
    config.headers = config.headers || {};
    // Set authorization header
    // ℹ️ JSON.parse will convert token to string
    config.headers.Authorization = token ? `Bearer ${token}` : '';
  } else {
    throw new Error('TokenIsNotExist');
  }
  // Return modified config
  return config;
});
// ℹ️ Add response interceptor to handle 401 response
axiosIns.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error
    if ([500, 404].includes(error?.response?.status)) {
      const errorStore = useErrorStore();
      errorStore.setErrors();
      return Promise.reject(error);
    }

    if (
      error.message == 'TokenIsNotExist' ||
      (error.response && error.response.status === 401)
    ) {
      // ℹ️ Logout user and redirect to login page
      // Remove "Datas" from localStorage

      // If 401 response returned from api
      router.push('/auth/start');
    } else {
      return Promise.reject(error);
    }
  },
);
export default axiosIns;

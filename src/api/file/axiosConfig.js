import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import axios from "axios";
import router from "@/router/index.js";
import { useUserStore } from "@/store/user/user.js";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

const baseUrl =
  import.meta.env["VITE_APP_BASE_URL"] + import.meta.env["VITE_APP_TUS_PATH"];

const axiosInstance = axios.create({
  // You can add your headers here
  // ================================
  baseURL: baseUrl,
  // timeout: 1000,
  // headers: { Authorization: "Bearer " + userStore.token },
});

axiosInstance.interceptors.request.use((config) => {
  const userStore = useUserStore();
  // Retrieve token from userStore
  const token = userStore.token;
  // If token is found
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = token ? `Bearer ${token}` : "";
  } else {
    throw new Error("TokenIsNotExist");
  }
  // Return modified config
  return config;
});

// ℹ️ Add response interceptor to handle 401 response
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error
    if (
      error.message == "TokenIsNotExist" ||
      (error.response && error.response.status === 401)
    ) {
      router.push("/auth/start");
    } else {
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;

const baseUrl = import.meta.env['VITE_APP_RTM_WEBSOCKET_URL'];
const path = 'rtm/api/v1/wws';
import { useErrorStore } from '@/store/errors.js';
// @/api/rtm/index.js
export const connector = (token) => {
  try {
    const deviceId = encodeURIComponent(
      navigator.vendor + navigator.userAgent + navigator.hardwareConcurrency,
    );
    const url = `${baseUrl}/${path}?t=${token}&device_id=${deviceId}`;
    return url;
  } catch (error) {
    if ([500, 404].includes(error?.response?.status)) {
      const errorStore = useErrorStore();
      errorStore.setErrors();
      return Promise.reject(error);
    }
  }
};

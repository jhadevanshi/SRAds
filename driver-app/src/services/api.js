import axios from 'axios';
import { getStorageItem, deleteStorageItem } from '../utils/storage';
import { DeviceEventEmitter } from 'react-native';

// Base API URL
let API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is not set. Please configure EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:5000/api');
}
API_URL = API_URL.trim();
if (API_URL.endsWith('/api')) {
  API_URL = API_URL.substring(0, API_URL.length - 4);
}
console.log("=== API_URL ===", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Hard 15s timeout for network resilience
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  async (config) => {
    // Ensure all requests are routed through /api to avoid axios path stripping issues
    if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }

    const token = await getStorageItem('driverToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized (Token Expiry)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and force re-login
      await deleteStorageItem('driverToken');
      DeviceEventEmitter.emit('auth:logout');
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
let API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is not set. Please create a .env file with EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:5000/api');
}
API_URL = API_URL.trim();
if (!API_URL.endsWith('/api')) {
  API_URL = `${API_URL}/api`;
}
console.log("=== API_URL ===", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  async (config) => {
    console.log('[API DEBUG] Full URL:', config.baseURL + config.url);
    console.log('[API DEBUG] Method:', config.method);
    console.log('[API DEBUG] Body:', JSON.stringify(config.data));
    const token = await AsyncStorage.getItem('businessToken');
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
    console.log('[API DEBUG] Error status:', error.response?.status);
    console.log('[API DEBUG] Error URL:', error.config?.url);
    console.log('[API DEBUG] Error baseURL:', error.config?.baseURL);
    console.log('[API DEBUG] Full URL hit:', error.config?.baseURL + error.config?.url);
    console.log('[API DEBUG] Response body:', JSON.stringify(error.response?.data));
    
    if (error.response && error.response.status === 401) {
      // Clear token to force re-login
      await AsyncStorage.removeItem('businessToken');
      // Dispatch custom event to AuthContext
      if (global.logoutCallback) {
        global.logoutCallback();
      }
    }
    return Promise.reject(error);
  }
);

export const WS_URL = API_URL.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');
export default api;

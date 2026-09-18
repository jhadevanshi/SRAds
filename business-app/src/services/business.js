import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const businessService = {
  // Auth
  register: async (data) => {
    const res = await api.post('/business/register', data);
    return res.data;
  },
  login: async (data) => {
    try {
      console.log('[AUTH] Attempting login for:', data.email);
      console.log('[AUTH] API URL:', process.env.EXPO_PUBLIC_API_URL);
      
      const response = await api.post('/business/login', data);
      
      console.log('[AUTH] Login success:', response.data);
      await AsyncStorage.setItem('businessToken', response.data.token);
      return { success: true, data: response.data, token: response.data.token, business: response.data.business };
      
    } catch (error) {
      // Log everything for debugging
      console.error('[AUTH] Login failed');
      console.error('[AUTH] Status:', error.response?.status);
      console.error('[AUTH] URL called:', error.config?.baseURL + error.config?.url);
      console.error('[AUTH] Response:', JSON.stringify(error.response?.data));
      console.error('[AUTH] Network error:', error.message);
      
      // Return specific error messages
      if (!error.response) {
        return { 
          success: false, 
          message: 'Cannot reach server. Check internet connection.' 
        };
      }
      
      if (error.response.status === 404) {
        return { 
          success: false, 
          message: `API route not found. URL: ${error.config?.baseURL + error.config?.url}` 
        };
      }
      
      if (error.response.status === 401) {
        return { 
          success: false, 
          message: 'Invalid email or password.' 
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Try again.' 
      };
    }
  },
  getProfile: async () => {
    const res = await api.get('/business/profile');
    return res.data;
  },

  // Dashboard
  getDashboard: async () => {
    const res = await api.get('/business/dashboard');
    return res.data;
  },
  getLiveDisplays: async () => {
    const res = await api.get('/business/live-displays');
    return res.data;
  },
  getLiveFleet: async () => {
    const res = await api.get('/business/fleet/live');
    return res.data;
  },

  // Ads
  getAds: async () => {
    const res = await api.get('/business/ads');
    return res.data;
  },
  uploadAd: async (formData) => {
    const res = await api.post('/business/ads/upload', formData, {
      transformRequest: (data, headers) => {
        // Delete the globally forced application/json header
        // This allows Axios to automatically generate the correct multipart/form-data boundary
        delete headers['Content-Type'];
        return data;
      },
    });
    return res.data;
  },
  deleteAd: async (id) => {
    const res = await api.delete(`/business/ads/${id}`);
    return res.data;
  },
  toggleAdStatus: async (id, action) => {
    const res = await api.put(`/business/ads/${id}/status`, { action });
    return res.data;
  },

  // Campaigns
  getCampaigns: async () => {
    const res = await api.get('/business/campaigns');
    return res.data;
  },
  createCampaign: async (data) => {
    const res = await api.post('/business/campaigns', data);
    return res.data;
  },

  // Analytics
  getAnalytics: async (range, date) => {
    const url = date ? `/business/analytics?range=${range}&date=${date}` : `/business/analytics?range=${range}`;
    const res = await api.get(url);
    return res.data;
  },

  // Wallet
  getWallet: async () => {
    const res = await api.get('/business/wallet');
    return res.data;
  },
  addFundsDirect: async (amount) => {
    const res = await api.post('/business/wallet/add-funds-direct', { amount });
    return res.data;
  },
  createOrder: async (amount) => {
    const res = await api.post('/business/wallet/create-order', { amount });
    return res.data;
  },
  verifyPayment: async (orderId) => {
    const res = await api.post('/business/wallet/verify-payment', { order_id: orderId });
    return res.data;
  },

  // --- SETTINGS MODULE (MOCK APIs) ---
  // TODO: Connect to real backend

  updateProfile: async (data) => {
    // data contains: { businessName, ownerName, email, phone, address }
    // Map it to backend expected fields
    const payload = {
      company_name: data.businessName,
      owner_name: data.ownerName,
      email: data.email,
      phone: data.phone,
      address: data.address
    };
    const res = await api.put('/business/profile', payload);
    return res.data;
  },

  getPaymentMethods: async () => {
    return { success: true, methods: [] };
  },

  addPaymentMethod: async (data) => {
    return { success: false, message: 'Not implemented' };
  },

  deletePaymentMethod: async (id) => {
    return { success: false, message: 'Not implemented' };
  },

  getLinkedDevices: async () => {
    return { success: true, devices: [] };
  },

  getDeviceDetails: async (id) => {
    return { success: false, message: 'Not implemented' };
  },

  getInvoices: async () => {
    return { success: true, invoices: [] };
  },
};

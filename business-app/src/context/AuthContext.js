import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { businessService } from '../services/business';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expose logout function to global scope for the Axios interceptor
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('businessToken');
      setUser(null);
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  useEffect(() => {
    global.logoutCallback = handleLogout;
    checkAuth();

    // Auto-refresh profile to keep wallet balance synced without reloading
    const interval = setInterval(() => {
      refreshProfile();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;

    let socket;
    let reconnectTimeout;
    let retryCount = 0;
    let isCancelled = false;

    const connect = () => {
      if (isCancelled) return;
      try {
        const { WS_URL } = require('../services/api');
        
        socket = new WebSocket(`${WS_URL}?advertiserId=${user.id}`);

        socket.onopen = () => {
          retryCount = 0;
        };

        socket.onmessage = (e) => {
          try {
            const event = JSON.parse(e.data);
            
            // Auto refresh profile/wallet balance on billing events
            if (event.type === 'AD_PLAYBACK_COMPLETED' || event.type === 'AD_SPEND_UPDATED') {
              refreshProfile();
            }

            // Emit to local screen event listeners
            const { DeviceEventEmitter } = require('react-native');
            DeviceEventEmitter.emit(event.type, event.data);
          } catch (err) {
            // Ignore parse errors
          }
        };

        socket.onerror = () => {
          // Handled silently to prevent Expo LogBox banner
        };

        socket.onclose = () => {
          if (isCancelled) return;
          retryCount++;
          // Exponential backoff up to 30s
          const delay = Math.min(5000 * Math.pow(1.5, Math.min(retryCount, 4)), 30000);
          reconnectTimeout = setTimeout(connect, delay);
        };
      } catch (err) {
        // Handled silently
      }
    };

    connect();

    return () => {
      isCancelled = true;
      if (socket) {
        try {
          socket.close();
        } catch (e) {
          // Ignore close errors on unmount
        }
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [user]);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('businessToken');
      if (token) {
        const res = await businessService.getProfile();
        if (res.success) {
          setUser(res.business);
        } else {
          await AsyncStorage.removeItem('businessToken');
        }
      }
    } catch (error) {
      console.error('Check auth error', error);
      await AsyncStorage.removeItem('businessToken');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('businessToken');
      if (token) {
        const res = await businessService.getProfile();
        if (res.success) setUser(res.business);
      }
    } catch (error) {
      // Silent fail on background refresh
    }
  };

  const login = async (email, password) => {
    try {
      const res = await businessService.login({ email, password });
      if (res.success && res.token) {
        await AsyncStorage.setItem('businessToken', res.token);
        setUser(res.business);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      // Extract the detailed message sent by the backend (e.g. "Your account is pending admin approval")
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during login';
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    handleLogout();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

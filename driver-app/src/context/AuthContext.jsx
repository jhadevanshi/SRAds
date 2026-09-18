import React, { createContext, useState, useEffect, useContext } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { getStorageItem, setStorageItem, deleteStorageItem } from '../utils/storage';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check storage for token on mount
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await getStorageItem('driverToken');
        if (token) {
          setUserToken(token);
        }
      } catch (e) {
        console.error('Failed to get token from storage', e);
      }
      setIsLoading(false);
    };

    bootstrapAsync();

    const sub = DeviceEventEmitter.addListener('auth:logout', () => {
      setUserToken(null);
    });
    return () => sub.remove();
  }, []);

  const login = async (phone, password) => {
    const res = await api.post('/driver/login', { phone, password });
    if (res.data.success) {
      const token = res.data.token;
      await setStorageItem('driverToken', token);
      setUserToken(token);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = async () => {
    try {
      await deleteStorageItem('driverToken');
      setUserToken(null);
    } catch (e) {
      console.error('Failed to remove token', e);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

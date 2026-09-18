import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setStorageItem(key, value) {
  if (Platform.OS === 'web') {
    return await AsyncStorage.setItem(key, value);
  } else {
    return await SecureStore.setItemAsync(key, value);
  }
}

export async function getStorageItem(key) {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function deleteStorageItem(key) {
  if (Platform.OS === 'web') {
    return await AsyncStorage.removeItem(key);
  } else {
    return await SecureStore.deleteItemAsync(key);
  }
}

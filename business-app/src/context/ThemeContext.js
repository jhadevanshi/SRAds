import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind'; // unused

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = 'business_app_theme_preference';

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState('system');
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'light');
  const [isInitializing, setIsInitializing] = useState(true);

  const resolvedTheme = themePreference === 'system' ? systemScheme : themePreference;
  const isDarkMode = resolvedTheme === 'dark';

  const setThemePreference = useCallback(async (newPref) => {
    if (newPref !== 'light' && newPref !== 'dark' && newPref !== 'system') return;
    setThemePreferenceState(newPref);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newPref);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      try {
        Appearance.setColorScheme(resolvedTheme);
      } catch (e) {
        console.error('Appearance sync error:', e);
      }
    }
  }, [resolvedTheme, isInitializing]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemePreferenceState(stored);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      } finally {
        setIsInitializing(false);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ themePreference, resolvedTheme, isDark: isDarkMode, isDarkMode, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

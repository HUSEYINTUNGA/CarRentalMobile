import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import lightColors from './colors.light';
import darkColors from './colors.dark';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState(systemScheme || 'light');

  // Persist theme to AsyncStorage
  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (e) {
      // handle error if needed
    }
  };

  // On mount, load theme from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      } catch (e) {
        // handle error if needed
      }
    })();
  }, []);

  const colors = useMemo(() => (theme === 'dark' ? darkColors : lightColors), [theme]);
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_THEME } from '@/constants/themes';
import type { Theme } from '@/types/navbar';

interface ThemeContextValue {
  selectedTheme: Theme;
  setSelectedTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('selectedTheme');

    return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem('selectedTheme', selectedTheme);
    document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
  }, [selectedTheme]);

  const toggleTheme = () => {
    setSelectedTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({
      selectedTheme,
      setSelectedTheme,
      toggleTheme,
    }),
    [selectedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

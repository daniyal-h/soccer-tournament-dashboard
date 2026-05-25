import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import type { Theme } from '@/types/navbar';

import { DEFAULT_THEME } from '@/constants/themes';

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

    if (storedTheme === 'dark') {
      return 'dark';
    }
    return DEFAULT_THEME; // light mode is default
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

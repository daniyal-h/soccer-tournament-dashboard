import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeProvider, useTheme } from './ThemeContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('uses the stored theme from localStorage', () => {
    localStorage.setItem('selectedTheme', 'dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.selectedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('falls back to default theme when stored theme is invalid', () => {
    localStorage.setItem('selectedTheme', 'banana');

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.selectedTheme).toBe('light');
  });

  it('toggles from light to dark', () => {
    localStorage.setItem('selectedTheme', 'light');

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.selectedTheme).toBe('dark');
    expect(localStorage.getItem('selectedTheme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles from dark to light', () => {
    localStorage.setItem('selectedTheme', 'dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.selectedTheme).toBe('light');
    expect(localStorage.getItem('selectedTheme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider',
    );
  });
});

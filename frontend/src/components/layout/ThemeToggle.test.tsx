import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as themeContext from '@/context/ThemeContext';

import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  it('renders dark mode toggle when current theme is light', () => {
    vi.spyOn(themeContext, 'useTheme').mockReturnValue({
      selectedTheme: 'light',
      toggleTheme: vi.fn(),
      setSelectedTheme: function (): void {
        throw new Error('Function not implemented.');
      },
    });

    render(<ThemeToggle />);

    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
  });

  it('renders light mode toggle when current theme is dark', () => {
    vi.spyOn(themeContext, 'useTheme').mockReturnValue({
      selectedTheme: 'dark',
      toggleTheme: vi.fn(),
      setSelectedTheme: function (): void {
        throw new Error('Function not implemented.');
      },
    });

    render(<ThemeToggle />);

    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    const toggleTheme = vi.fn();

    vi.spyOn(themeContext, 'useTheme').mockReturnValue({
      selectedTheme: 'light',
      toggleTheme,
      setSelectedTheme: function (): void {
        throw new Error('Function not implemented.');
      },
    });

    render(<ThemeToggle />);

    fireEvent.click(screen.getByLabelText('Switch to dark mode'));

    expect(toggleTheme).toHaveBeenCalledOnce();
  });
});

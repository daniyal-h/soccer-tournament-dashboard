import { Moon,Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { selectedTheme, toggleTheme } = useTheme();

  const isDark = selectedTheme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

export default ThemeToggle;

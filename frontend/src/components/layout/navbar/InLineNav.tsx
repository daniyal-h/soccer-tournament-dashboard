import { NavLink } from 'react-router-dom';

import { type NavProps } from '@/types/navbar';

import { cn } from '@/lib/utils';

interface DesktopNavProps extends NavProps {
  className?: string;
}

/** A row of buttons for the given navigation items */
const DesktopNav = ({ navItems, className }: DesktopNavProps) => {
  return (
    <div className={cn('flex items-center', className)}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
              // Stryker disable next-line StringLiteral: base layout/style classes are visual-only
              'rounded-md px-2 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            ].join(' ')
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
};

export default DesktopNav;

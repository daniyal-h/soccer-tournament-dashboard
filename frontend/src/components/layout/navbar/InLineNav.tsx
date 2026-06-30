import { NavLink, useLocation } from 'react-router-dom';

import { type NavProps } from '@/types/navbar';

import { cn } from '@/lib/utils';

import { isNavItemActive } from '@/utils/layout/navigationHelper';

interface InLineNavProps extends NavProps {
  className?: string;
}

/** A row of buttons for the given navigation items */
const InLineNav = ({ navItems, className }: InLineNavProps) => {
  const { pathname } = useLocation();

  return (
    // Stryker disable next-line StringLiteral: base flex layout classes are visual-only
    <div className={cn('flex items-center', className)}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={() =>
            [
              // Stryker disable next-line StringLiteral: base layout/style classes are visual-only
              'rounded-md px-3 py-2 text-base max-[400px]:text-[14px] font-medium transition-colors',
              isNavItemActive(pathname, item.to)
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            ].join(' ')
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
};

export default InLineNav;

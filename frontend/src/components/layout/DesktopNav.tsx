import { NavLink } from 'react-router-dom';

import ThemeToggle from '@/components/layout/ThemeToggle';

type NavItem = {
  to: string;
  label: string;
};

interface DesktopNavProps {
  navItems: NavItem[];
}

const DesktopNav = ({ navItems }: DesktopNavProps) => {
  return (
    <div className="hidden items-center gap-2 md:flex">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
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

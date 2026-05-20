import { NavLink } from 'react-router-dom';

import { type NavProps } from '@/types/navbar';

const DesktopNav = ({ navItems }: NavProps) => {
  return (
    <div className="flex items-center gap-2">
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

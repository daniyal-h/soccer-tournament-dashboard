import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Standings', to: '/standings' },
  { label: 'Schedule', to: '/schedule' },
];

const Navbar = () => {
  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="text-lg font-semibold">
          Soccer Dashboard
        </NavLink>

        <div className="flex items-center gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'text-sm font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

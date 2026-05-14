import { NavLink } from 'react-router-dom';
import TournamentSelector from './TournamentSelector';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Standings', to: '/' },
  { label: 'Schedule', to: '/schedule' },
  { label: 'Bracket', to: '/bracket'},
  { label: 'Teams', to: '/teams' },
  { label: 'Statistics', to: '/stats' },
];

const Navbar = () => {
  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <NavLink to="/" className="text-lg font-semibold">
          Soccer Dashboard
        </NavLink>

        <div className="w-full md:w-auto">
          <TournamentSelector />
        </div>

        <div className="flex items-center justify-between md:justify-end md:gap-4">
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

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

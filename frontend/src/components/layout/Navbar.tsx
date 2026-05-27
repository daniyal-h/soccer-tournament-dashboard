import { NavLink } from 'react-router-dom';

import { NAV_ITEMS, PRIMARY_NAV_ITEMS } from '@/constants/navigation';

import CompactNav from './navbar/CompactNav';
import InLineNav from './navbar/InLineNav';
import ThemeToggle from './ThemeToggle';
import TournamentSelector from './TournamentSelector';

/**
 * Render the Navbar which contains the site name, tournament selector,
 * navigation quick-links and theme selector
 * Dynamically render and resize to fit smaller screens
 */
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

        <div className="hidden min-[500px]:flex items-center gap-4 justify-between">
          <InLineNav navItems={NAV_ITEMS} className="gap-4" />

          <ThemeToggle />
        </div>

        <div className="grid w-full grid-cols-[auto_1fr_auto] items-center min-[500px]:hidden">
          <CompactNav navItems={NAV_ITEMS} />

          <div className="flex justify-center">
            <InLineNav navItems={PRIMARY_NAV_ITEMS} className="gap-2" />
          </div>

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

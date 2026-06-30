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
      <nav className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3 min-[1050px]:flex-row min-[1050px]:items-center min-[1050px]:gap-4 min-[500px]:px-6 min-[1050px]:px-8">
        <NavLink to="/" className="text-lg font-semibold shrink-0">
          Soccer Dashboard
        </NavLink>

        <div className="w-full min-[1050px]:flex-1 min-[1050px]:flex min-[1050px]:justify-center">
          <div className="w-full min-[1050px]:w-75">
            <TournamentSelector />
          </div>
        </div>

        {/* Smallest: hamburger + 2 primary + toggle */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center min-[570px]:hidden">
          <CompactNav navItems={NAV_ITEMS} />
          <div className="flex justify-center">
            <InLineNav navItems={PRIMARY_NAV_ITEMS} className="gap-2" />
          </div>
          <ThemeToggle />
        </div>

        {/* Middle: 5 links inline + toggle (stacked as row 3) */}
        <div className="hidden min-[570px]:flex min-[1050px]:hidden items-center gap-2">
          <InLineNav navItems={NAV_ITEMS} className="gap-2" />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Largest: 5 links + toggle in single row */}
        <div className="hidden min-[1050px]:flex items-center gap-4 ml-auto shrink-0">
          <InLineNav navItems={NAV_ITEMS} className="gap-4" />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

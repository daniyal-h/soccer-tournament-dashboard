import { NavLink } from 'react-router-dom';
import TournamentSelector from './TournamentSelector';
import DesktopNav from './DesktopNav';
import CompactNav from './CompactNav';
import QuickNav from './QuickNav';
import ThemeToggle from './ThemeToggle';

import { PRIMARY_NAV_ITEMS, NAV_ITEMS } from '@/constants/navigation';

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

        <div className="hidden min-[500px]:flex items-center gap-4">
          <DesktopNav navItems={NAV_ITEMS} />
          <ThemeToggle />
        </div>

        <div className="grid w-full grid-cols-[auto_1fr_auto] items-center min-[500px]:hidden">
          <CompactNav navItems={NAV_ITEMS} />

          <div className="flex justify-center">
            <QuickNav navItems={PRIMARY_NAV_ITEMS} />
          </div>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

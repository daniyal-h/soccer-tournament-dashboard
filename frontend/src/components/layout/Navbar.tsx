import { NavLink } from 'react-router-dom';
import TournamentSelector from './TournamentSelector';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import ThemeToggle from './ThemeToggle';

import { navItems } from '@/constants/navigation';

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

          <DesktopNav navItems={navItems} />
          <MobileNav navItems={navItems} />

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { type NavProps } from '@/types/navbar';

import { isNavItemActive } from '@/utils/layout/navigationHelper';

/**
 * A compact form of Desktop Nav menu
 * Renders a side menu through button-click to show navigation items
 */
const CompactNav = ({ navItems }: NavProps) => {
  // Stryker disable next-line BooleanLiteral: equivalent mutant since it defaults to false upon render too
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  // close the sheet whenever the route actually changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="flex items-center">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-64 p-6"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            document.getElementById('main-heading')?.focus();
          }}
        >
          <SheetTitle className="mb-6 text-lg">Navigation</SheetTitle>

          <div className="flex flex-col gap-5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={() =>
                  [
                    // Stryker disable next-line StringLiteral: base layout/style classes are visual-only
                    'rounded-md px-3 py-2 text-base font-medium transition-colors',
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
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CompactNav;

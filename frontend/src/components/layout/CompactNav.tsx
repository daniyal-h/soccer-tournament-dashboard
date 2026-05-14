import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { type NavProps } from '@/constants/navigation';

import { Menu } from 'lucide-react';

const MobileNav = ({ primaryNavItems, navItems }: NavProps) => {
  return (
    <div className="flex w-full items-center justify-between min-[500px]:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-64 p-6" showCloseButton={false}>
          <SheetTitle className="mb-6 text-lg">Navigation</SheetTitle>

          <div className="flex flex-col gap-5">
            {navItems.map((item) => (
              <SheetClose asChild key={item.to}>
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'rounded-md px-3 py-2 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              </SheetClose>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-4">
        {primaryNavItems?.map((item) => (
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
    </div>
  );
};

export default MobileNav;

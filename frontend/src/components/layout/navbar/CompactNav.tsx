import { Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { type NavProps } from '@/types/navbar';

const MobileNav = ({ navItems }: NavProps) => {
  return (
    <div className="flex items-center">
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
    </div>
  );
};

export default MobileNav;

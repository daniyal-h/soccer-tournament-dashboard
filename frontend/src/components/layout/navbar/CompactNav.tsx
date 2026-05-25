import { useState } from 'react';
import { Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { type NavProps } from '@/types/navbar';

const CompactNav = ({ navItems }: NavProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-64 p-6">
          <SheetTitle className="mb-6 text-lg">Navigation</SheetTitle>

          <div className="flex flex-col gap-5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
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
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CompactNav;

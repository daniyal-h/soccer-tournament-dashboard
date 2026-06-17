import { cn } from '@/lib/utils';

interface TeamNameProps {
  name: string;
  shortName: string;
  className?: string;
}

const ResponsiveTeamName = ({ name, shortName, className }: TeamNameProps) => (
  <>
    <span className={cn('hidden min-[400px]:inline truncate', className)}>{name}</span>

    <span className={cn('inline min-[400px]:hidden', className)}>{shortName}</span>
  </>
);

export default ResponsiveTeamName;

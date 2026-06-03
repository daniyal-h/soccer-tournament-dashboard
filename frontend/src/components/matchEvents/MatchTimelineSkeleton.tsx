import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const skeletonEvents = [
  { side: 'left', width: 'w-28', hasScore: true },
  { side: 'right', width: 'w-36', hasScore: false },
  { side: 'left', width: 'w-32', hasScore: false },
  { side: 'right', width: 'w-24', hasScore: true },
] as const;

interface TimelineEventSkeletonProps {
  side: 'left' | 'right';
  nameWidth: string;
  hasScore: boolean;
}

function TimelineEventSkeleton({ side, nameWidth, hasScore }: TimelineEventSkeletonProps) {
  const card = (
    <Card className="w-[42vw] p-4 shadow-md sm:w-80">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="hidden h-5 w-5 rounded-full min-[500px]:block" />
          <Skeleton className="h-4 w-20" />
        </div>

        <Skeleton className="h-6 w-12 rounded-full" />
      </div>

      <div>
        <Skeleton className={`h-5 ${nameWidth}`} />
        <Skeleton className="mt-2 h-4 w-35" />

        {hasScore && <Skeleton className="mt-4 h-8 w-16 rounded-full" />}

        <Skeleton className="mt-3 h-3 w-24" />
      </div>
    </Card>
  );

  return (
    <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-6">
      <div className="flex min-w-0 justify-end">{side === 'left' && card}</div>

      <div className="z-10 flex justify-center">
        <Skeleton className="hidden h-10 w-14 rounded-full border bg-background min-[500px]:block" />
      </div>

      <div className="flex min-w-0 justify-start">{side === 'right' && card}</div>
    </div>
  );
}

const MatchTimelineSkeleton = () => {
  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 h-full w-px bg-border" />

      {skeletonEvents.map((event, index) => (
        <TimelineEventSkeleton
          key={index}
          side={event.side}
          nameWidth={event.width}
          hasScore={event.hasScore}
        />
      ))}
    </div>
  );
};

export default MatchTimelineSkeleton;

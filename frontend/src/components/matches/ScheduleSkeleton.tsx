import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const skeletonDays = ['day-1', 'day-2'];
const skeletonCards = ['card-1', 'card-2', 'card-3', 'card-4'];

/**
 * A skeleton for the match schedule data being loaded in
 * Matches the same accordion and card grid behavior as the actual schedule
 */
const ScheduleSkeleton = () => {
  return (
    <div className="space-y-6 pt-2" data-testid="schedule-skeleton">
      {skeletonDays.map((dayKey) => (
        <div key={dayKey} className="border-b">
          {/* Skeleton for day accordion trigger */}
          <div className="flex h-10 items-center justify-between py-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>

          {/* Skeleton for match cards */}
          <div className="px-1 pb-4 pt-2">
            <div className="grid gap-4 md:grid-cols-2">
              {skeletonCards.map((cardKey) => (
                // Stryker disable next-line StringLiteral
                <Card key={`${dayKey}-${cardKey}`} className="w-full shadow-sm">
                  <CardContent className="min-w-0 space-y-3 p-4">
                    <div className="flex flex-col items-center gap-4">
                      <Skeleton className="h-6 w-24 rounded-full" />

                      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
                        <div className="flex min-w-0 items-center justify-end gap-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-6 rounded-sm" />
                        </div>

                        <Skeleton className="mx-4 h-5 w-16" />

                        <div className="flex min-w-0 items-center justify-start gap-2">
                          <Skeleton className="h-6 w-6 rounded-sm" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>

                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleSkeleton;

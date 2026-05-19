import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CARD_COUNT = 4;
const ROW_COUNT = 4;

const StandingsSkeleton = () => {
  return (
    <div className="min-h-screen space-y-4 pt-2">
      {/* Legends skeleton */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Group cards skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-6">
        {Array.from({ length: CARD_COUNT }).map((_, cardIndex) => (
          <Card key={cardIndex} className="w-full shadow-sm">
            <CardContent className="p-3">
              <div className="border-b">
                <div className="flex h-12 items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>

              <div className="pt-4">
                <div className="mb-2 grid grid-cols-[2rem_minmax(0,1fr)_repeat(4,2rem)] items-center gap-2 px-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-12" />
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-4 w-6 justify-self-center" />
                  ))}
                </div>

                <div className="space-y-2">
                  {Array.from({ length: ROW_COUNT }).map((_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="grid grid-cols-[2rem_minmax(0,1fr)_repeat(4,2rem)] items-center gap-2 rounded-md px-2 py-2"
                    >
                      <Skeleton className="h-4 w-4" />

                      <div className="flex min-w-0 items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-12 sm:w-24" />
                      </div>

                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-4 w-5 justify-self-center" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StandingsSkeleton;

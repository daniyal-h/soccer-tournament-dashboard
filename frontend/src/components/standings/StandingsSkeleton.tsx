import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const skeletonCards = ['card-1', 'card-2', 'card-3', 'card-4'];
const skeletonRows = ['row-1', 'row-2', 'row-3', 'row-4'];
const skeletonStats = ['stat-1', 'stat-2', 'stat-3', 'stat-4'];

const StandingsSkeleton = () => {
  return (
    <div className="min-h-screen space-y-4 pt-2" data-testid="standings-skeleton">
      {/* Skeleton for the Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Skeleton className="h-4 w-2/3" data-testid="legend-skeleton" />
      </div>

      {/* Skeleton for the group cards as a grid */}
      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        {skeletonCards.map((cardKey) => (
          <Card key={cardKey} className="w-full shadow-sm" data-testid="standings-card-skeleton">
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
                  {
                    // Stryker disable next-line ArrowFunction: skeleton is just a visual placeholder
                    skeletonStats.map((statKey) => (
                      <Skeleton key={statKey} className="h-4 w-6 justify-self-center" />
                    ))
                  }
                </div>

                <div className="space-y-2">
                  {skeletonRows.map((rowKey) => (
                    <div
                      key={rowKey}
                      className="grid grid-cols-[2rem_minmax(0,1fr)_repeat(4,2rem)] items-center gap-2 rounded-md px-2 py-2"
                      data-testid="standings-row-skeleton"
                    >
                      <Skeleton className="h-4 w-4" />

                      <div className="flex min-w-0 items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-12 sm:w-24" />
                      </div>

                      {
                        // Stryker disable next-line ArrowFunction: skeleton is just a visual placeholder
                        skeletonStats.map((statKey) => (
                          <Skeleton
                            // Stryker disable next-line StringLiteral: skeleton is just a visual placeholder
                            key={`${rowKey}-${statKey}`}
                            className="h-4 w-5 justify-self-center"
                          />
                        ))
                      }
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

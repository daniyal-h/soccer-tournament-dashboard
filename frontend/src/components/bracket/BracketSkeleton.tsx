import { Skeleton } from '@/components/ui/skeleton';

export function BracketSkeleton() {
  return (
    <>
      <div className="space-y-7 md:hidden">
        <div
          className="grid w-full sm:w-fit sm:gap-4 pt-5"
          style={{
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-16 rounded-md" />
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto pb-4 md:block">
        <div className="flex min-w-max gap-6 px-1 pt-6">
          {Array.from({ length: 4 }).map((_, columnIndex) => (
            <div key={columnIndex} className="w-[26rem] shrink-0 space-y-5">
              <Skeleton className="mx-auto h-6 w-32" />

              <div className="space-y-6">
                {Array.from({ length: columnIndex === 0 ? 4 : 2 }).map((_, cardIndex) => (
                  <Skeleton key={cardIndex} className="h-40 rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MatchHeaderSkeleton = () => {
  return (
    <Card className="mb-10 p-6 text-center shadow-sm">
      <div className="mb-5 flex flex-col items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-5 w-20" />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-8">
        <div className="flex min-w-0 flex-col items-end gap-2">
          <Skeleton className="h-10 w-10 rounded-sm" />

          <div className="flex min-w-0 max-w-full flex-col items-end gap-2 text-right">
            <Skeleton className="h-7 w-28 sm:h-8 sm:w-40" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Skeleton className="h-9 w-16 sm:h-14 sm:w-24" />
          <Skeleton className="mt-2 h-5 w-20" />
        </div>

        <div className="flex min-w-0 flex-col items-start gap-2">
          <Skeleton className="h-10 w-10 rounded-sm" />

          <div className="flex min-w-0 max-w-full flex-col items-start gap-2 text-left">
            <Skeleton className="h-7 w-32 sm:h-8 sm:w-44" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-44" />
      </div>
    </Card>
  );
};

export default MatchHeaderSkeleton;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TeamProfileSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card className="mb-4 p-6 text-center shadow-sm sm:mb-10">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-15 w-15 rounded-full sm:h-24 sm:w-24" />

          <div className="flex w-full flex-col items-center gap-2">
            <Skeleton className="h-9 w-48 sm:h-14 sm:w-90" />
            <Skeleton className="h-7 w-10" />
          </div>

          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Group Stage Summary</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Skeleton className="h-23 rounded-lg" />
            <Skeleton className="h-23 rounded-lg" />
            <Skeleton className="h-23 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamProfileSkeleton;

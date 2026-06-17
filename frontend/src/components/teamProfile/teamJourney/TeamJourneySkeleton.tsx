import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const TeamJourneySkeleton = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-5 w-36" />

          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <div className="flex items-center justify-between py-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-4" />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-4">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamJourneySkeleton;

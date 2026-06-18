import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const TeamSquadSkeleton = () => {
  const labelWidths = ['w-28', 'w-20', 'w-24', 'w-18'];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Team Squad</CardTitle>
        <CardDescription>Loading roster and squad details...</CardDescription>
      </CardHeader>

      <CardContent>
        {labelWidths.map((width, i) => (
          <div key={i}>
            <div className="flex items-center justify-between py-4">
              <Skeleton className={`h-5 ${width}`} />
              <Skeleton className="size-4 rounded-sm" />
            </div>
            <Separator />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TeamSquadSkeleton;

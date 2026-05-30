import { type MatchStatus } from '@/types/matches';

import { MATCH_STATUS_BADGE } from '@/constants/schedule';

import { cn } from '@/lib/utils';

import { Badge } from '../ui/badge';

interface MatchStatusBadgeProps {
  status: MatchStatus;
}

const MatchStatusBadge = ({ status }: MatchStatusBadgeProps) => {
  const badge = MATCH_STATUS_BADGE[status];
  return (
    <Badge variant="outline" className={cn('text-medium', badge.className)}>
      {badge.text}
    </Badge>
  );
};

export default MatchStatusBadge;

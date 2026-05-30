import { type MatchStatus } from '@/types/matches';

import { MATCH_STATUS_BADGE } from '@/constants/matches';

import { cn } from '@/lib/utils';

import { Badge } from '../ui/badge';

interface MatchStatusBadgeProps {
  status: MatchStatus;
  elapsed?: number;
}

const MatchStatusBadge = ({ status, elapsed }: MatchStatusBadgeProps) => {
  const badge = MATCH_STATUS_BADGE[status];
  return (
    <Badge variant="outline" className={cn('text-medium', badge.className)}>
      {badge.text}
      {status === 'live' && elapsed != null && ' · ' + elapsed + "'"}
    </Badge>
  );
};

export default MatchStatusBadge;

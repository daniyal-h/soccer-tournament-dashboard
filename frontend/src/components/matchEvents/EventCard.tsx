import type { MatchEvent } from '@/types/matchEvent';

import { ICON_SIZE } from '@/constants/matchEvents';

import { cn } from '@/lib/utils';

import { Card } from '../ui/card';

import {
  formatEventMinute,
  getEventConfig,
  getPlayerName,
  getSecondaryPlayerName,
} from '@/utils/matchEvents/EventCardHelper';

interface EventCardProps {
  event: MatchEvent;
  score: string;
}

function EventCard({ event, score }: EventCardProps) {
  const playerName = getPlayerName(event);
  const secondaryPlayerName = getSecondaryPlayerName(event);

  const config = getEventConfig(event.event_type);
  const Icon = config.icon;

  const isGoalEvent =
    event.event_type === 'goal' ||
    event.event_type === 'penalty_goal' ||
    event.event_type === 'own_goal';

  const isSubstitution = event.event_type === 'substitution';

  return (
    <Card className={cn('w-[42vw] p-4 shadow-md sm:w-80', config.cardClassName)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center min-[500px]:gap-2">
          <span className="hidden min-[500px]:inline-flex" aria-hidden="true">
            <Icon className={cn(ICON_SIZE, config.iconClassName)} />
          </span>

          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {config.title}
          </span>
        </div>

        <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">
          {formatEventMinute(event)}
        </span>
      </div>

      <div>
        <p className="text-base font-bold leading-tight">{playerName}</p>

        {secondaryPlayerName && isGoalEvent && (
          <p className="mt-1 text-sm text-muted-foreground">Assisted by {secondaryPlayerName}</p>
        )}

        {secondaryPlayerName && isSubstitution && (
          <p className="mt-1 text-sm text-muted-foreground">Replaced {secondaryPlayerName}</p>
        )}

        {isGoalEvent && (
          <div className="mt-4 inline-flex rounded-full bg-muted px-3 py-1 text-lg font-bold">
            {score}
          </div>
        )}

        {event.detail && <p className="mt-2 text-xs text-muted-foreground">{event.detail}</p>}

        {event.comments && (
          <p className="mt-1 text-xs italic text-muted-foreground">{event.comments}</p>
        )}
      </div>
    </Card>
  );
}

export default EventCard;

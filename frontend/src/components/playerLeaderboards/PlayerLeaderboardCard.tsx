import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import type { RankedPlayer } from '@/types/playerLeaderboard';

import { RANK_CARD_STYLES } from '@/constants/tournamentTeams';

import { cn } from '@/lib/utils';

import { formatMinutes, formatRating } from '@/utils/playerLeaderboards/playerLeaderboardsHelper';
import { getInitials } from '@/utils/teams/teamSquadHelper';

type PlayerLeaderboardCardProps = {
  player: RankedPlayer;
  valueLabel: string;
};

function PlayerLeaderboardCard({ player: rankedPlayer, valueLabel }: PlayerLeaderboardCardProps) {
  const { rank, value, player, team, appearances, minutes_played, rating } = rankedPlayer;

  const minutesText = formatMinutes(minutes_played);
  const ratingText = formatRating(rating);
  const appearancesSuffix = appearances !== null && appearances > 1 ? 'matches' : 'match';

  const rankStyle = RANK_CARD_STYLES[rank];

  return (
    <article
      className={cn(
        'flex min-w-0 items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-colors',
        rankStyle,
      )}
    >
      <div className="flex shrink-0 items-center justify-center text-lg font-bold text-primary sm:h-11 sm:w-11 sm:rounded-full sm:bg-primary/10">
        #{rank}
      </div>

      <Avatar className="h-14 w-14 shrink-0 border">
        <AvatarImage src={player.photo_url ?? undefined} alt={player.display_name} />
        <AvatarFallback>{getInitials(player.display_name)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-tight">
              {player.display_name}
            </h3>

            <p className="truncate text-sm text-muted-foreground">
              {team.name}
              {team.short_name ? ` · ${team.short_name}` : ''}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {valueLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 pt-2 text-xs text-muted-foreground">
          {appearances !== null && (
            <span>
              {appearances} {appearancesSuffix} ·{' '}
            </span>
          )}
          {minutesText && <span>{minutesText} · </span>}
          {ratingText && <span>Rating {ratingText}</span>}
        </div>
      </div>
    </article>
  );
}

export default PlayerLeaderboardCard;

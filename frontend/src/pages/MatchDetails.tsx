import { useParams } from 'react-router-dom';

import MatchHeader from '@/components/matchEvents/matchHeader/MatchHeader';
import MatchTimeline from '@/components/matchEvents/MatchTimeline';

import type { Match } from '@/types/match';
import type { MatchEvent } from '@/types/matchEvent';

const canada = {
  id: 1,
  external_api_id: 1,
  name: 'Canada',
  short_name: 'CAN',
  type: 'national',
  logo_url: 'https://media.api-sports.io/football/teams/5529.png',
  country: 'Canada',
};

const france = {
  id: 2,
  external_api_id: 2,
  name: 'France',
  short_name: 'FRA',
  type: 'national',
  logo_url: 'https://media.api-sports.io/football/teams/2.png',
  country: 'France',
};

const stubMatch: Match = {
  id: 1,

  team_a: canada,
  team_b: france,

  kickoff_time: '2026-06-12T20:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'finished',
  venue: 'MetLife Stadium',

  team_a_score: 2,
  team_b_score: 1,
};

const stubEvents: MatchEvent[] = [
  {
    team: canada,
    player_name: 'Jonathan David',
    secondary_player_name: 'Alphonso Davies',
    event_type: 'goal',
    minute: 12,
    detail: 'Normal Goal',
    comments: 'Right footed shot',
  },
  {
    team: france,
    player_name: 'Kylian Mbappe',
    secondary_player_name: 'Antoine Griezmann',
    event_type: 'penalty_goal',
    minute: 28,
    detail: 'Penalty',
    comments: 'Converted from the spot',
  },
  {
    team: canada,
    player_name: 'Stephen Eustaquio',
    secondary_player_name: 'Jonathan David',
    event_type: 'own_goal',
    minute: 43,
    detail: 'Own Goal',
    comments: 'Deflection inside the box',
  },
  {
    team: france,
    player_name: 'Olivier Giroud',
    secondary_player_name: 'Kylian Mbappe',
    event_type: 'penalty_miss',
    minute: 58,
    detail: 'Penalty Missed',
    comments: 'Saved by goalkeeper',
  },
  {
    team: canada,
    player_name: 'Tajon Buchanan',
    secondary_player_name: 'Alphonso Davies',
    event_type: 'yellow_card',
    minute: 67,
    detail: 'Yellow Card',
    comments: 'Unsporting behaviour',
  },
  {
    team: france,
    player_name: 'Theo Hernandez',
    secondary_player_name: 'Jules Kounde',
    event_type: 'red_card',
    minute: 75,
    detail: 'Red Card',
    comments: 'Serious foul play',
  },
  {
    team: canada,
    player_name: 'Cyle Larin',
    secondary_player_name: 'Jonathan David',
    event_type: 'substitution',
    minute: 90,
    extra_minute: 4,
    detail: 'Substitution',
    comments: 'Tactical change',
  },
];

export const stubPenaltyMatch: Match = {
  ...stubMatch,

  status: 'finished',

  team_a_score: 3,
  team_b_score: 3,

  team_a_penalties: 4,
  team_b_penalties: 2,
};

export const penaltyStubEvents: MatchEvent[] = [
  ...stubEvents,

  {
    team: france,
    player_name: 'Kylian Mbappe',
    secondary_player_name: 'Theo Hernandez',
    event_type: 'goal',
    minute: 80,
    detail: 'Normal Goal',
    comments: 'Late equalizer',
  },
  {
    team: canada,
    player_name: 'Jonathan David',
    secondary_player_name: 'Alphonso Davies',
    event_type: 'goal',
    minute: 90,
    extra_minute: 2,
    detail: 'Normal Goal',
    comments: 'Stoppage time goal',
  },
  {
    team: france,
    player_name: 'Kylian Mbappe',
    event_type: 'penalty_goal',
    minute: 90,
    extra_minute: 8,
    detail: 'Penalty',
    comments: 'Last minute equalizer',
  },
];

const MatchDetails = () => {
  // const { matchId } = useParams();

  return (
    <div>
      <MatchHeader match={stubPenaltyMatch} />
      <MatchTimeline match={stubPenaltyMatch} events={penaltyStubEvents} />
    </div>
  );
};

export default MatchDetails;

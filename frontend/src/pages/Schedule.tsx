import MatchSchedule from '@/components/schedule/MatchSchedule';

import { useTournament } from '@/context/TournamentContext';

import { type Match, type MatchGroup } from '@/types/matches';

export const mockMatches: Match[] = [
  {
    id: 1,
    team_a: {
      id: 1,
      name: 'Canada',
      short_name: 'CAN',
      logo_url: 'https://media.api-sports.io/football/teams/5529.png',
    },
    team_b: {
      id: 2,
      name: 'France',
      short_name: 'FRA',
      logo_url: 'https://media.api-sports.io/football/teams/2.png',
    },
    kickoff_time: new Date('2026-06-11T19:00:00Z').toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    stage: 'group',
    group: 'A',
    status: 'live',
    venue: 'BMO Field',
    city: 'Toronto',
    elapsed: 88,
    team_a_score: 9,
    team_b_score: 0,
  },
  {
    id: 2,
    team_a: {
      id: 3,
      name: 'Brazil',
      short_name: 'BRA',
      logo_url: 'https://media.api-sports.io/football/teams/6.png',
    },
    team_b: {
      id: 4,
      name: 'Japan',
      short_name: 'JPN',
      logo_url: 'https://media.api-sports.io/football/teams/12.png',
    },
    kickoff_time: new Date('2026-06-11T22:00:00Z').toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    stage: 'group',
    group: 'B',
    status: 'scheduled',
    venue: 'BC Place',
    city: 'Vancouver',
  },
  {
    id: 3,
    team_a: {
      id: 5,
      name: 'Argentina',
      short_name: 'ARG',
      logo_url: 'https://media.api-sports.io/football/teams/26.png',
    },
    team_b: {
      id: 6,
      name: 'Germany',
      short_name: 'GER',
      logo_url: 'https://media.api-sports.io/football/teams/25.png',
    },
    kickoff_time: new Date('2026-06-12T18:00:00Z').toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    stage: 'round_of_16',
    status: 'finished',
    venue: 'MetLife Stadium',
    city: 'New York',
    elapsed: 90,
    team_a_score: 2,
    team_b_score: 1,
  },
  {
    id: 4,
    team_a: {
      id: 7,
      name: 'England',
      short_name: 'ENG',
      logo_url: 'https://media.api-sports.io/football/teams/10.png',
    },
    team_b: {
      id: 8,
      name: 'Portugal',
      short_name: 'POR',
      logo_url: 'https://media.api-sports.io/football/teams/27.png',
    },
    kickoff_time: new Date('2026-06-12T21:00:00Z').toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    stage: 'quarter_final',
    status: 'postponed',
    venue: 'SoFi Stadium',
    city: 'Los Angeles',
  },
  {
    id: 5,
    team_a: {
      id: 9,
      name: 'Spain',
      short_name: 'ESP',
      logo_url: 'https://media.api-sports.io/football/teams/9.png',
    },
    team_b: {
      id: 10,
      name: 'Netherlands',
      short_name: 'NED',
      logo_url: 'https://media.api-sports.io/football/teams/1118.png',
    },
    kickoff_time: new Date('2026-06-13T20:00:00Z').toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    stage: 'semi_final',
    status: 'cancelled',
    venue: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
  },
];

export const mockGroupedMatches: MatchGroup[] = [
  {
    day: 'June 11',
    matches: [mockMatches[0], mockMatches[1], mockMatches[2], mockMatches[3]],
  },
  {
    day: 'June 12',
    matches: [mockMatches[2], mockMatches[3]],
  },
  {
    day: 'June 13',
    matches: [mockMatches[4]],
  },
];

const Schedule = () => {
  const { selectedTournament } = useTournament();

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Schedule (stub!)</h1>

      <p className="text-muted-foreground">
        View upcoming and completed tournament matches for the{' '}
        {selectedTournament?.name ?? 'the selected tournament'}.
      </p>

      <MatchSchedule groupedMatches={mockGroupedMatches} />
    </section>
  );
};

export default Schedule;

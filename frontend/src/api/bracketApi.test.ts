import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBracket } from './bracketsApi';
import { apiGet } from './client';

vi.mock('./client', () => ({
  apiGet: vi.fn(),
}));

const mockedApiGet = vi.mocked(apiGet);

function makeTeam(id = 1) {
  return {
    id,
    name: `Team ${id}`,
    short_name: `T${id}`,
    logo_url: `https://example.com/team-${id}.png`,
  };
}

function makeMatch(id = 1) {
  return {
    id,
    team_a: makeTeam(1),
    team_b: makeTeam(2),
    kickoff_time: '2026-07-19T20:00:00Z',
    stage: 'final',
    group: null,
    status: 'scheduled',
    venue: 'MetLife Stadium',
    city: 'New York',
    elapsed: null,
    team_a_score: null,
    team_b_score: null,
    team_a_penalties: null,
    team_b_penalties: null,
  };
}

function makeBracket(overrides = {}) {
  return {
    round_of_32: [],
    round_of_16: [],
    quarter_final: [],
    semi_final: [],
    third_place: [],
    final: [],
    ...overrides,
  };
}

describe('getBracket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the tournament bracket endpoint', async () => {
    const bracket = makeBracket();

    mockedApiGet.mockResolvedValueOnce(bracket);

    const result = await getBracket({ tournament_id: 7 });

    expect(mockedApiGet).toHaveBeenCalledOnce();
    expect(mockedApiGet).toHaveBeenCalledWith('/tournaments/7/bracket');
    expect(result).toEqual(bracket);
  });

  it('accepts an empty bracket response', async () => {
    const bracket = makeBracket();

    mockedApiGet.mockResolvedValueOnce(bracket);

    await expect(getBracket({ tournament_id: 7 })).resolves.toEqual(bracket);
  });

  it('accepts populated bracket stages', async () => {
    const finalMatch = makeMatch(1);
    const semiFinalMatch = {
      ...makeMatch(2),
      stage: 'semi_final',
      status: 'finished',
      team_a_score: 2,
      team_b_score: 1,
    };

    const bracket = makeBracket({
      semi_final: [semiFinalMatch],
      final: [finalMatch],
    });

    mockedApiGet.mockResolvedValueOnce(bracket);

    const result = await getBracket({ tournament_id: 7 });

    expect(result.semi_final).toEqual([semiFinalMatch]);
    expect(result.final).toEqual([finalMatch]);
  });

  it.each([
    ['round_of_32'],
    ['round_of_16'],
    ['quarter_final'],
    ['semi_final'],
    ['third_place'],
    ['final'],
  ])('rejects response when %s is missing', async (stage) => {
    const bracket = makeBracket();
    delete (bracket as Record<string, unknown>)[stage];

    mockedApiGet.mockResolvedValueOnce(bracket);

    await expect(getBracket({ tournament_id: 7 })).rejects.toThrow('Invalid bracket response');
  });

  it.each([
    ['round_of_32'],
    ['round_of_16'],
    ['quarter_final'],
    ['semi_final'],
    ['third_place'],
    ['final'],
  ])('rejects response when %s is not a match list', async (stage) => {
    const bracket = makeBracket({
      [stage]: {},
    });

    mockedApiGet.mockResolvedValueOnce(bracket);

    await expect(getBracket({ tournament_id: 7 })).rejects.toThrow('Invalid bracket response');
  });

  it.each([null, undefined, [], 'bracket', 42, true])(
    'rejects non-object bracket response: %s',
    async (value) => {
      mockedApiGet.mockResolvedValueOnce(value);

      await expect(getBracket({ tournament_id: 7 })).rejects.toThrow('Invalid bracket response');
    },
  );

  it('rejects a bracket stage containing an invalid match', async () => {
    const bracket = makeBracket({
      final: [
        {
          ...makeMatch(1),
          id: undefined,
        },
      ],
    });

    mockedApiGet.mockResolvedValueOnce(bracket);

    await expect(getBracket({ tournament_id: 7 })).rejects.toThrow('Invalid bracket response');
  });

  it('propagates apiGet failures', async () => {
    mockedApiGet.mockRejectedValueOnce(new Error('network exploded'));

    await expect(getBracket({ tournament_id: 7 })).rejects.toThrow('network exploded');
  });
});

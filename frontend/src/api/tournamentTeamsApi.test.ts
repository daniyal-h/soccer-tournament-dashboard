import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TournamentTeam } from '@/types/tournamentTeam';

import { getTournamentTeams } from './tournamentTeamsApi';

vi.mock('./client', () => ({
  apiGet: vi.fn(),
}));

vi.mock('./teamsApi', () => ({
  isTeamSummary: vi.fn(),
}));

import { apiGet } from './client';
import { isTeamSummary } from './teamsApi';

const mockApiGet = vi.mocked(apiGet);
const mockIsTeamSummary = vi.mocked(isTeamSummary);

const validTeamSummary = {
  id: 1,
  name: 'Argentina',
  short_name: 'ARG',
  logo_url: 'https://example.com/arg.png',
};

function createTournamentTeam(overrides: Partial<TournamentTeam> = {}): TournamentTeam {
  return {
    team: validTeamSummary,
    group: 'A',
    final_rank: 1,
    stage_reached: 'final',
    ...overrides,
  };
}

async function expectInvalidTournamentTeamsResponse(data: unknown) {
  mockApiGet.mockResolvedValueOnce(data as TournamentTeam[]);

  await expect(getTournamentTeams({ tournament_id: 42 })).rejects.toThrow(
    'Invalid tournament teams response',
  );
}

describe('getTournamentTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockIsTeamSummary.mockImplementation(
      (value): value is typeof validTeamSummary => value === validTeamSummary,
    );
  });

  it('calls the tournament teams endpoint with the tournament id', async () => {
    mockApiGet.mockResolvedValueOnce([]);

    await getTournamentTeams({ tournament_id: 42 });

    expect(mockApiGet).toHaveBeenCalledOnce();
    expect(mockApiGet).toHaveBeenCalledWith('/tournaments/42/teams');
  });

  it('returns a valid tournament teams response', async () => {
    const response = [
      createTournamentTeam(),
      createTournamentTeam({
        team: validTeamSummary,
        group: 'B',
        final_rank: null,
        stage_reached: 'semi_final',
      }),
    ];

    mockApiGet.mockResolvedValueOnce(response);

    await expect(getTournamentTeams({ tournament_id: 42 })).resolves.toEqual(response);
  });

  it('accepts nullable tournament-scoped fields', async () => {
    const response = [
      createTournamentTeam({
        group: null,
        final_rank: null,
        stage_reached: null,
      }),
    ];

    mockApiGet.mockResolvedValueOnce(response);

    await expect(getTournamentTeams({ tournament_id: 42 })).resolves.toEqual(response);
  });

  it('accepts an empty teams response', async () => {
    mockApiGet.mockResolvedValueOnce([]);

    await expect(getTournamentTeams({ tournament_id: 42 })).resolves.toEqual([]);
  });

  it.each([
    ['null response', null],
    ['object response', { data: [createTournamentTeam()] }],
    ['string response', 'not an array'],
    ['number response', 123],
  ])('rejects a non-array response: %s', async (_, response) => {
    await expectInvalidTournamentTeamsResponse(response);
  });

  it.each([
    ['null item', null],
    ['string item', 'Argentina'],
    ['number item', 1],
  ])('rejects a non-object tournament team item: %s', async (_, item) => {
    await expectInvalidTournamentTeamsResponse([item]);
  });

  it('rejects when team summary validation fails', async () => {
    const invalidTeam = { ...validTeamSummary, id: '1' };

    mockIsTeamSummary.mockImplementation(
      (value): value is typeof validTeamSummary => value === validTeamSummary,
    );

    await expectInvalidTournamentTeamsResponse([
      createTournamentTeam({ team: invalidTeam as never }),
    ]);

    expect(mockIsTeamSummary).toHaveBeenCalledWith(invalidTeam);
  });

  it.each([
    ['undefined group', { group: undefined }],
    ['number group', { group: 1 }],
    ['object group', { group: {} }],
  ])('rejects invalid group: %s', async (_, overrides) => {
    await expectInvalidTournamentTeamsResponse([
      createTournamentTeam(overrides as Partial<TournamentTeam>),
    ]);
  });

  it.each([
    ['undefined final rank', { final_rank: undefined }],
    ['string final rank', { final_rank: '1' }],
    ['object final rank', { final_rank: {} }],
  ])('rejects invalid final_rank: %s', async (_, overrides) => {
    await expectInvalidTournamentTeamsResponse([
      createTournamentTeam(overrides as Partial<TournamentTeam>),
    ]);
  });

  it.each([
    ['undefined stage reached', { stage_reached: undefined }],
    ['number stage reached', { stage_reached: 1 }],
    ['object stage reached', { stage_reached: {} }],
  ])('rejects invalid stage_reached: %s', async (_, overrides) => {
    await expectInvalidTournamentTeamsResponse([
      createTournamentTeam(overrides as Partial<TournamentTeam>),
    ]);
  });

  it('rejects when any item in the response is invalid', async () => {
    await expectInvalidTournamentTeamsResponse([
      createTournamentTeam(),
      createTournamentTeam({ final_rank: '1' as never }),
    ]);
  });

  it('propagates apiGet errors', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network failed'));

    await expect(getTournamentTeams({ tournament_id: 42 })).rejects.toThrow('Network failed');
  });
});

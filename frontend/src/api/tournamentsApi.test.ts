import { afterEach, describe, expect, it, vi } from 'vitest';

import * as client from './client';
import { getTournaments } from './tournamentsApi';

const validTournament = {
  id: 1,
  name: 'FIFA World Cup',
  season: '2026',
  logo_url: null,
  start_date: '2026-06-11',
  end_date: '2026-07-19',
};

describe('getTournaments', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls apiGet with the tournaments endpoint', async () => {
    const apiGetSpy = vi.spyOn(client, 'apiGet').mockResolvedValue([]);

    await getTournaments();

    expect(apiGetSpy).toHaveBeenCalledWith('/tournaments/');
  });

  it('returns valid tournaments', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue([validTournament]);

    await expect(getTournaments()).resolves.toEqual([validTournament]);
  });

  it('allows string logo URLs', async () => {
    const tournament = {
      ...validTournament,
      logo_url: 'https://example.com/logo.png',
    };

    vi.spyOn(client, 'apiGet').mockResolvedValue([tournament]);

    await expect(getTournaments()).resolves.toEqual([tournament]);
  });

  it('allows tournaments with null logo_url', async () => {
    const tournament = {
      id: 1,
      name: 'FIFA World Cup',
      season: '2026',
      logo_url: null,
      start_date: '2026-06-11',
      end_date: '2026-07-19',
    };

    vi.spyOn(client, 'apiGet').mockResolvedValue([tournament]);

    const result = await getTournaments();

    expect(result[0].logo_url).toBeNull();
  });

  it('throws when response is not an array', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue({});

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('throws when response is null', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue(null);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('throws when response contains a non-object item', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue(['invalid']);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('throws when id is not a number', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue([{ ...validTournament, id: '1' }]);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('throws when name is not a string', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue([{ ...validTournament, name: 123 }]);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('throws when season is not a string', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue([{ ...validTournament, season: 2026 }]);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('throws when logo_url is neither null nor a string', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue([{ ...validTournament, logo_url: 123 }]);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('throws when start_date is not a string', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue([{ ...validTournament, start_date: null }]);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('throws when end_date is not a string', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue([{ ...validTournament, end_date: null }]);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('rejects function values', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue([() => {}]);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('rejects null tournament entries', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue([null]);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('rejects string tournament entries', async () => {
    vi.spyOn(client, 'apiGet').mockResolvedValue(['abc']);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });

  it('rejects function objects pretending to be tournaments', async () => {
    const fakeTournament = new Proxy(() => {}, {
      get(_target, prop) {
        const values: Record<string, unknown> = {
          id: 1,
          name: 'Fake',
          season: '2026',
          logo_url: null,
          start_date: '2026-01-01',
          end_date: '2026-12-31',
        };

        return values[String(prop)];
      },
    });

    vi.spyOn(client, 'apiGet').mockResolvedValue([fakeTournament]);

    await expect(getTournaments()).rejects.toThrow('Invalid tournaments response');
  });
});

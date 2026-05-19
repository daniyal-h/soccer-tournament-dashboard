import { describe, expect, it, vi } from 'vitest';

import * as client from './client';
import { getTournaments } from './tournamentsApi';

describe('getTournaments', () => {
  it('calls apiGet with the tournaments endpoint', async () => {
    const apiGetSpy = vi.spyOn(client, 'apiGet').mockResolvedValue([]);

    await getTournaments();

    expect(apiGetSpy).toHaveBeenCalledWith('/tournaments/');
  });
});

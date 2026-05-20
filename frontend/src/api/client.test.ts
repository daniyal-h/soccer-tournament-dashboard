import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiGet } from './client';

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

describe('apiGet', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns parsed JSON when the request succeeds', async () => {
    const responseBody = [{ id: 1, name: 'FIFA World Cup' }];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseBody,
    });

    const result = await apiGet<typeof responseBody>('/tournaments/');

    expect(result).toEqual(responseBody);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('throws a safe backend error message for whitelisted error codes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: {
          status: 404,
          code: 'NOT_FOUND',
          message: 'No tournaments found',
        },
      }),
    });

    await expect(apiGet('/tournaments/')).rejects.toThrow('No tournaments found');
  });

  it('throws a generic message for non-whitelisted backend errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: {
          status: 500,
          code: 'INTERNAL_ERROR',
          message: 'Database exploded dramatically',
        },
      }),
    });

    await expect(apiGet('/tournaments/')).rejects.toThrow('Something went wrong.');
  });

  it('throws a generic message when the error response is not valid JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await expect(apiGet('/tournaments/')).rejects.toThrow('Something went wrong.');
  });

  it('throws a network error when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    await expect(apiGet('/tournaments/')).rejects.toThrow('Unable to reach the server.');
  });

  it('throws ApiError instances', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    await expect(apiGet('/tournaments/')).rejects.toBeInstanceOf(ApiError);
  });
});

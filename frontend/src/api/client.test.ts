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

  it('uses default status and code when omitted', () => {
    const error = new ApiError('Boom');

    expect(error.message).toBe('Boom');
    expect(error.status).toBe(500);
    expect(error.code).toBe('UNKNOWN_ERROR');
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

  it('calls fetch with the API base URL and path', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await apiGet('/tournaments/1/standings');

    expect(mockFetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_BASE_URL}/tournaments/1/standings`,
    );
  });

  it('throws ApiError with safe backend status and code', async () => {
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

    try {
      await apiGet('/tournaments/');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('No tournaments found');
      expect((error as ApiError).status).toBe(404);
      expect((error as ApiError).code).toBe('NOT_FOUND');
    }
  });

  it('rethrows ApiError without wrapping it as a network error', async () => {
    const apiError = new ApiError('Original API error', 418, 'TEAPOT');

    mockFetch.mockRejectedValueOnce(apiError);

    try {
      await apiGet('/teapot');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect(error).toBe(apiError);
      expect((error as ApiError).message).toBe('Original API error');
      expect((error as ApiError).status).toBe(418);
      expect((error as ApiError).code).toBe('TEAPOT');
    }
  });

  it('keeps response status when backend error status is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          code: 'BAD_REQUEST',
          message: 'Bad request from backend',
        },
      }),
    });

    try {
      await apiGet('/bad-request');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
      expect((error as ApiError).code).toBe('BAD_REQUEST');
      expect((error as ApiError).message).toBe('Bad request from backend');
    }
  });

  it('uses UNKNOWN_ERROR when backend error code is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: {
          status: 500,
          message: 'Hidden backend details',
        },
      }),
    });

    try {
      await apiGet('/server-error');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(500);
      expect((error as ApiError).code).toBe('UNKNOWN_ERROR');
      expect((error as ApiError).message).toBe('Something went wrong.');
    }
  });

  it('uses backend error status when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          status: 404,
          code: 'NOT_FOUND',
          message: 'Not found',
        },
      }),
    });

    try {
      await apiGet('/missing');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(404);
    }
  });

  it('falls back to response status when backend error status is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests.',
        },
      }),
    });

    try {
      await apiGet('/limited');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect((error as ApiError).status).toBe(429);
    }
  });

  it('uses backend error code when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: {
          status: 429,
          code: 'RATE_LIMITED',
          message: 'Too many requests.',
        },
      }),
    });

    try {
      await apiGet('/limited');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect((error as ApiError).code).toBe('RATE_LIMITED');
    }
  });

  it('falls back to UNKNOWN_ERROR when backend error code is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: {
          status: 500,
          message: 'Server exploded',
        },
      }),
    });

    try {
      await apiGet('/server-error');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect((error as ApiError).code).toBe('UNKNOWN_ERROR');
    }
  });

  it('uses safe backend error messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: {
          status: 404,
          code: 'NOT_FOUND',
          message: 'Tournament not found.',
        },
      }),
    });

    await expect(apiGet('/missing')).rejects.toThrow('Tournament not found.');
  });

  it('does not expose unsafe backend error messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: {
          status: 500,
          code: 'INTERNAL_ERROR',
          message: 'database password is abc123',
        },
      }),
    });

    await expect(apiGet('/server-error')).rejects.toThrow('Something went wrong.');
  });

  it('does not expose backend message when code is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          status: 400,
          message: 'Backend detail without code',
        },
      }),
    });

    await expect(apiGet('/bad-request')).rejects.toThrow('Something went wrong.');
  });

  it('falls back to generic ApiError when error body cannot be parsed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    try {
      await apiGet('/broken-json');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('Something went wrong.');
      expect((error as ApiError).status).toBe(500);
      expect((error as ApiError).code).toBe('UNKNOWN_ERROR');
    }
  });

  it('falls back to generic error when response body has no error object', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    try {
      await apiGet('/server-error');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('Something went wrong.');
      expect((error as ApiError).status).toBe(500);
      expect((error as ApiError).code).toBe('UNKNOWN_ERROR');
    }
  });

  it('falls back to generic error when error object is null', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: null,
      }),
    });

    try {
      await apiGet('/server-error');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('Something went wrong.');
      expect((error as ApiError).status).toBe(500);
      expect((error as ApiError).code).toBe('UNKNOWN_ERROR');
    }
  });

  it('does not expose safe-code message when message is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: {
          status: 404,
          code: 'NOT_FOUND',
        },
      }),
    });

    await expect(apiGet('/missing-message')).rejects.toThrow('Something went wrong.');
  });

  it('wraps fetch failures as network ApiError', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    try {
      await apiGet('/tournaments/');
      throw new Error('Expected apiGet to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('Unable to reach the server.');
      expect((error as ApiError).status).toBe(0);
      expect((error as ApiError).code).toBe('NETWORK_ERROR');
    }
  });
});

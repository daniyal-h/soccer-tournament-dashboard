import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/client';

import { getApiErrorState } from './apiErrorHelper';

describe('getApiErrorState', () => {
  it('maps NOT_FOUND to non-retryable not found state', () => {
    expect(getApiErrorState(new ApiError('missing', 404, 'NOT_FOUND'))).toEqual({
      message: 'Requested data was not found.',
      canRetry: false,
    });
  });

  it('maps RATE_LIMITED to retryable rate limit state', () => {
    expect(getApiErrorState(new ApiError('slow down', 429, 'RATE_LIMITED'))).toEqual({
      message: 'Too many requests. Please wait a moment and try again.',
      canRetry: true,
    });
  });

  it('maps NETWORK_ERROR to retryable network state', () => {
    expect(getApiErrorState(new ApiError('offline', 0, 'NETWORK_ERROR'))).toEqual({
      message: 'Unable to reach the server.',
      canRetry: true,
    });
  });

  it('maps unknown ApiError codes to generic retryable state', () => {
    expect(getApiErrorState(new ApiError('server exploded', 500, 'SERVER_ERROR'))).toEqual({
      message: 'Something went wrong.',
      canRetry: true,
    });
  });

  it('maps non-ApiError failures to generic retryable state', () => {
    expect(getApiErrorState(new Error('boom'))).toEqual({
      message: 'Something went wrong.',
      canRetry: true,
    });
  });

  it('allows hook-specific messages to override defaults', () => {
    expect(
      getApiErrorState(new ApiError('missing', 404, 'NOT_FOUND'), {
        notFound: 'No matches were found.',
        generic: 'Failed to load matches.',
      }),
    ).toEqual({
      message: 'No matches were found.',
      canRetry: false,
    });
  });
});

// src/utils/errors/apiErrorHelper.ts
import { ApiError } from '@/api/client';

type ErrorState = {
  message: string;
  canRetry: boolean;
};

const DEFAULT_MESSAGES = {
  notFound: 'Requested data was not found.',
  rateLimited: 'Too many requests. Please wait a moment and try again.',
  network: 'Unable to reach the server.',
  generic: 'Something went wrong.',
};

export function getApiErrorState(
  err: unknown,
  messages: Partial<typeof DEFAULT_MESSAGES> = {},
): ErrorState {
  const resolvedMessages = {
    ...DEFAULT_MESSAGES,
    ...messages,
  };

  if (err instanceof ApiError && err.code === 'NOT_FOUND') {
    return {
      message: resolvedMessages.notFound,
      canRetry: false,
    };
  }

  if (err instanceof ApiError && err.code === 'RATE_LIMITED') {
    return {
      message: resolvedMessages.rateLimited,
      canRetry: true,
    };
  }

  if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
    return {
      message: resolvedMessages.network,
      canRetry: true,
    };
  }

  return {
    message: resolvedMessages.generic,
    canRetry: true,
  };
}

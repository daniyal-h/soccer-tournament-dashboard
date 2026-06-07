import type { ResponseMetadata } from '@/types/metadata';

export const EMPTY_RESPONSE_METADATA: ResponseMetadata = {
  is_delayed: false,
  last_updated: null,
  last_successful_refresh: null,
  message: null,
};

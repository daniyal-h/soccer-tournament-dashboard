import {
  type QueryKey,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import { getApiErrorState } from '@/utils/errors/apiErrorHelper';

interface ApiErrorMessages {
  notFound: string;
  generic: string;
}

interface UseApiQueryOptions<TQueryFnData, TData> extends Omit<
  UseQueryOptions<TQueryFnData, Error, TData, QueryKey>,
  'queryKey' | 'queryFn'
> {
  queryKey: QueryKey;
  queryFn: () => Promise<TQueryFnData>;
  errorMessages: ApiErrorMessages;
}

type ApiQueryResult<TData> = UseQueryResult<TData, Error> & {
  displayError: Error | null;
  canRetry: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  retry: (refetchTournamentsOnRetry?: boolean) => Promise<void>;
};

export function useApiQuery<TQueryFnData, TData = TQueryFnData>({
  queryKey,
  queryFn,
  errorMessages,
  ...options
}: UseApiQueryOptions<TQueryFnData, TData>): ApiQueryResult<TData> {
  const queryClient = useQueryClient();

  const query = useQuery<TQueryFnData, Error, TData, QueryKey>({
    queryKey,
    queryFn,
    ...options,
  });

  const errorState = query.error ? getApiErrorState(query.error, errorMessages) : null;

  const retry = async (refetchTournamentsOnRetry = false) => {
    if (refetchTournamentsOnRetry) {
      await Promise.all([
        query.refetch(),
        queryClient.refetchQueries({
          queryKey: ['tournaments'],
          type: 'active',
        }),
      ]);

      return;
    }

    await query.refetch();
  };

  return {
    ...query,
    displayError: errorState ? new Error(errorState.message) : null,
    canRetry: errorState?.canRetry ?? false,
    isInitialLoading: query.isPending && !query.data,
    isRefreshing: query.isFetching && !!query.data,
    retry,
  };
}

import { useMemo } from 'react';
import { useResource } from '@/hooks/api/useResource';
import type { User } from '@/types/admin/user';
import { KEYCLOAK_API_REMOTE_URL } from '@/config/platformenv';

// Define the API response structure to match the server
export interface ApiUsersResponse {
  total: number;
  next: boolean;
  prev: boolean;
  offset: number;
  limit: number;
  data: User[];
}

interface UseUsersQueryOptions {
  shouldFetch?: boolean;
  userId?: string;
  email?: string;
  limit?: number;
  offset?: number;
}

export const useUsersQuery = (options: UseUsersQueryOptions = { shouldFetch: true }) => {
  // For queries - returns User objects only
  const { getOne: getUser, getAll: getAllUsers } = useResource<User>(
    'users',
    KEYCLOAK_API_REMOTE_URL,
    true
  );

  const queryParams = useMemo(() => ({
    limit: options.limit ?? 10,
    offset: options.offset ?? 0,
  }), [options.limit, options.offset]);

  // List users with pagination - only when not fetching a specific user
  const { data: usersResponse, isLoading, isFetching, isError } = getAllUsers<ApiUsersResponse>({
    url: '/bh-user/get-users/',
    queryOptions: {
      enabled: options.shouldFetch && !options.email, // Don't fetch list when fetching single user
      retry: 2
    },
    params: queryParams
  });

  // Get single user by email
  const {
    data: user,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
    isError: isUserError
  } = options.email ? getUser({
    url: `/bh-user/get-user-details/${options.email}`,
    queryOptions: {
      enabled: !!options.email,
      retry: 2
    }
  }) : {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false
  };

  const users = usersResponse?.data || [];
  const total = usersResponse?.total || 0;
  const offset = usersResponse?.offset || 0;
  const limit = usersResponse?.limit || 0;
  const prev = usersResponse?.prev || false;
  const next = usersResponse?.next || false;

  return {
    users,
    user,
    isLoading,
    isUserLoading,
    isFetching,
    isUserFetching,
    isError,
    isUserError,
    total,
    offset,
    limit,
    prev,
    next,
  };
};

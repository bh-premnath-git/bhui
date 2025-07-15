import { useMemo, useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import type { User, UserMutationData } from '@/types/admin/user';
import { toast } from 'sonner';
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

interface UseUsersOptions {
  shouldFetch?: boolean;
  userId?: string;
  email?: string;
  limit?: number;
  offset?: number;
}

interface ApiErrorOptions {
  action: 'create' | 'update' | 'delete' | 'search' | 'fetch';
  context?: string;
  silent?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
  const { action, context = 'user', silent = false } = options;
  const errorMessage = `Failed to ${action} ${context}`;
  console.error(`${errorMessage}:`, error);
  if (!silent) {
    toast.error(errorMessage);
  }
  return error;
};

export const useUsers = (options: UseUsersOptions = { shouldFetch: true }) => {
  // For queries - returns User objects
  const { getOne: getUser, getAll: getAllUsers } = useResource<User>(
    'users',
    KEYCLOAK_API_REMOTE_URL,
    true
  );

  // For mutations - accepts UserMutationData
  const { create: createUser, update: updateUser, remove: removeUser } = useResource<UserMutationData>(
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
    url: '/bh-user/get-tenant-users/',
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
    url: `/bh-user/get-tenant-user-details/${options.email}`,
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

  // Create user mutation
  const createUserMutation = createUser({
    url: '/bh-user/create-tenant-user',
    mutationOptions: {
      onSuccess: () => toast.success('User created successfully'),
      onError: (error) => {
        handleApiError(error, { action: 'create' });
        return Promise.reject(error);
      },
    },
  });

  // Update user mutation
  const updateUserMutation = updateUser('/users', {
    mutationOptions: {
      onSuccess: () => toast.success('User updated successfully'),
      onError: (error) => handleApiError(error, { action: 'update' }),
    },
  });

  // Delete user mutation
  const deleteUserMutation = removeUser('/users', {
    mutationOptions: {
      onSuccess: () => toast.success('User deleted successfully'),
      onError: (error) => handleApiError(error, { action: 'delete' }),
    },
  });

  // Type-safe mutation handlers
  const handleCreateUser = useCallback(async (data: UserMutationData) => {
    await createUserMutation.mutateAsync({
      data
    });
  }, [createUserMutation]);

  const handleUpdateUser = useCallback(async (id: string, data: UserMutationData) => {
    await updateUserMutation.mutateAsync({
      data,
      params: { id }
    });
  }, [updateUserMutation]);

  const handleDeleteUser = useCallback(async (id: string) => {
    await deleteUserMutation.mutateAsync({
      params: { id }
    });
  }, [deleteUserMutation]);

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
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser
  };
};

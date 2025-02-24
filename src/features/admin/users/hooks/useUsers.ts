import { useMemo, useState, useEffect } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import type { User, UserMutationData } from '@/types/admin/user';
import { toast } from 'sonner';
import { KEYCLOAK_API_PORT } from '@/config/platformenv';

interface UseUsersOptions {
  shouldFetch?: boolean;
  userId?: string;
}

interface ApiErrorOptions {
  action: 'create' | 'update' | 'delete' | 'search' | 'fetch';
  context?: string;
  silent?: boolean;
}

interface ApiError extends Error {
  response?: {
    status: number;
    data?: {
      detail?: string;
    };
  };
}

const isUserNotFoundError = (error: unknown): boolean => {
  const apiError = error as ApiError;
  return (
    apiError?.response?.status === 404 && 
    typeof apiError?.response?.data?.detail === 'string' &&
    apiError.response.data.detail.includes('User not found')
  );
};

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
  const { action, context = 'user', silent = false } = options;
  const errorMessage = `Failed to ${action} ${context}`;
  console.error(`${errorMessage}:`, error);
  if (!silent) {
    toast.error(errorMessage);
  }
  throw error;
};

export const useUsers = (options: UseUsersOptions = { shouldFetch: true }) => {
  const {
    getAll,
    getOne,
    createMutation,
    updateMutation
  } = useResource<User>('users', KEYCLOAK_API_PORT, false);

  // Get all users query
  const usersQuery = getAll('/users/', { 
    enabled: options.shouldFetch 
  });

  // Get single user query
  const userQuery = getOne(`/users/${options.userId || ''}`, { 
    enabled: !!options.userId && options.shouldFetch 
  });

  const { data: users, isLoading, isFetching, isError } = usersQuery;
  const { 
    data: user, 
    isLoading: isUserLoading, 
    isFetching: isUserFetching, 
    isError: isUserError 
  } = userQuery;

  const handleCreateUser = async (data: UserMutationData) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        url: '/users'
      });
      toast.success('User created successfully');
    } catch (error) {
      handleApiError(error, { action: 'create' });
    }
  };

  const handleUpdateUser = async (id: string, data: UserMutationData) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        url: `/users/${id}`
      });
      toast.success('User updated successfully');
    } catch (error) {
      handleApiError(error, { action: 'update' });
    }
  };

  return {
    users,
    user,
    isLoading,
    isUserLoading,
    isFetching,
    isUserFetching,
    isError,
    isUserError,
    handleCreateUser,
    handleUpdateUser
  };
};

export const useUserSearch = () => {
  const { getOne } = useResource<User>('users', KEYCLOAK_API_PORT, false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);

  // Create a stable reference to getOne query
  const searchUser = useMemo(() => 
    getOne(`/users/${searchQuery}`, {
      enabled: !!searchQuery,
      retry: false // Don't retry on 404
    }), [getOne, searchQuery]);

  const { data, isLoading, error } = searchUser;

  useEffect(() => {
    // Reset states when search query is empty
    if (!searchQuery) {
      setSearchedUser(null);
      setUserNotFound(false);
      return;
    }

    // Handle errors
    if (error) {
      if (isUserNotFoundError(error)) {
        setUserNotFound(true);
        setSearchedUser(null);
      } else {
        // For other errors, just reset states
        setUserNotFound(false);
        setSearchedUser(null);
      }
      return;
    }

    // Handle successful response
    if (data) {
      setSearchedUser(data);
      setUserNotFound(false);
    }
  }, [searchQuery, data, error]);

  // Create a stable debounced function with proper dependencies
  const debounceSearchUser = useMemo(
    () => debounce((query: string) => {
      console.log('Debounced search:', query);
      setSearchQuery(query);
    }, 500),
    [setSearchQuery]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debounceSearchUser.cancel();
    };
  }, [debounceSearchUser]);

  return {
    searchedUser,
    searchLoading: isLoading,
    userNotFound,
    debounceSearchUser
  };
};

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import type { User, UserMutationData } from '@/types/admin/user';
import { toast } from 'sonner';
import { KEYCLOAK_API_PORT } from '@/config/platformenv';

interface UseUsersOptions {
  shouldFetch?: boolean;
  userId?: string;
  mutationsOnly?: boolean;
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

export const useUsers = (options: UseUsersOptions = { mutationsOnly: true }) => {
  const {
    getAll,
    getOne,
    createMutation,
    updateMutation
  } = useResource<User>('users', KEYCLOAK_API_PORT, false);

  const usersQuery = !options.mutationsOnly ? getAll('/users/', {
    enabled: options.shouldFetch
  }) : null;

  const userQuery = !options.mutationsOnly ? getOne(`/users/${options.userId || ''}`, {
    enabled: !!options.userId && options.shouldFetch
  }) : null;

  const { data: users, isLoading, isFetching, isError } = usersQuery || {};
  const {
    data: user,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
    isError: isUserError
  } = userQuery || {};

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
    isLoading: isLoading || false,
    isUserLoading: isUserLoading || false,
    isFetching: isFetching || false,
    isUserFetching: isUserFetching || false,
    isError: isError || false,
    isUserError: isUserError || false,
    handleCreateUser,
    handleUpdateUser
  };
};

export const useUserSearch = () => {
  const { getOne } = useResource<User>('users', KEYCLOAK_API_PORT, false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const response = await getOne(`/users/${query}`, { retry: false });
      if (response.data) {
        setSearchedUser(response.data);
        setUserNotFound(false);
      }
    } catch (error) {
      if (isUserNotFoundError(error)) {
        setUserNotFound(true);
        setSearchedUser(null);
      } else {
        console.error("User search error:", error);
        toast.error("Error searching for user.");
        setUserNotFound(false);
        setSearchedUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getOne]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchedUser(null);
      setUserNotFound(false);
      return;
    }

    fetchUser(searchQuery);
  }, [searchQuery, fetchUser]);

  const debounceSearchUser = useMemo(() =>
    debounce((query: string) => {
      console.log('Debounced search:', query);
      setSearchQuery(query);
    }, 500),
    [setSearchQuery]
  );

  useEffect(() => {
    return () => {
      debounceSearchUser.cancel();
    };
  }, [debounceSearchUser]);

  return {
    searchedUser,
    searchLoading: isLoading,
    userNotFound,
    debounceSearchUser,
  };
};
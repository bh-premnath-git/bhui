import { useState, useEffect, useMemo, useCallback } from 'react';
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
  // For queries - returns User objects
  const { getOne: getUser, getAll: getAllUsers } = useResource<User>(
    'users',
    KEYCLOAK_API_PORT,
    false
  );

  // For mutations - accepts different types for different operations
  const { create: createUser } = useResource<UserMutationData>(
    'users',
    KEYCLOAK_API_PORT,
    false
  );

  const { update: updateUser } = useResource<UserMutationData>(
    'users',
    KEYCLOAK_API_PORT,
    false
  );

  const { update: updateUserProjects } = useResource<{ projects: string[] }>(
    'users',
    KEYCLOAK_API_PORT,
    false
  );

  const { update: updateUserRoles } = useResource<{ realm_roles: string[] }>(
    'users',
    KEYCLOAK_API_PORT,
    false
  );

  // List users
  const { data: users, isLoading, isFetching, isError } = !options.mutationsOnly 
    ? getAllUsers({
        url: '/users/',
        queryOptions: {
          enabled: options.shouldFetch,
          retry: 2
        }
      })
    : { data: undefined, isLoading: false, isFetching: false, isError: false };

  // Get single user
  const {
    data: user,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
    isError: isUserError
  } = !options.mutationsOnly && options.userId
    ? getUser({
        url: `/users/${options.userId}`,
        queryOptions: {
          enabled: !!options.userId && options.shouldFetch,
          retry: 2
        }
      })
    : { data: undefined, isLoading: false, isFetching: false, isError: false };

  // Create user mutation
  const createUserMutation = createUser({
    url: '/users',
    mutationOptions: {
      onSuccess: () => toast.success('User created successfully'),
      onError: (error) => handleApiError(error, { action: 'create' }),
    },
  });

  // Update user mutations
  const updateUserMutation = updateUser('/users', {
    mutationOptions: {
      onSuccess: () => toast.success('User updated successfully'),
      onError: (error) => handleApiError(error, { action: 'update' }),
    },
  });

  const updateUserProjectsMutation = updateUserProjects('/users', {
    mutationOptions: {
      onSuccess: () => toast.success('User projects updated successfully'),
      onError: (error) => handleApiError(error, { action: 'update', context: 'user projects' }),
    },
  });

  const updateUserRolesMutation = updateUserRoles('/users', {
    mutationOptions: {
      onSuccess: () => toast.success('User roles updated successfully'),
      onError: (error) => handleApiError(error, { action: 'update', context: 'user roles' }),
    },
  });

  // Type-safe mutation handlers
  const handleCreateUser = useCallback(async (data: UserMutationData) => {
    await createUserMutation.mutateAsync({
      data
    });
  }, [createUserMutation]);

  const handleUpdateUser = useCallback(async (
    id: string, 
    data: UserMutationData | { projects: string[] } | { realm_roles: string[] }, 
    type?: 'projects' | 'roles'
  ) => {
    const url = `/users/${id}${type ? `/${type}` : ''}`;

    if (type === 'projects') {
      await updateUserProjectsMutation.mutateAsync({
        data: data as { projects: string[] },
        url
      });
    } else if (type === 'roles') {
      await updateUserRolesMutation.mutateAsync({
        data: data as { realm_roles: string[] },
        url
      });
    } else {
      await updateUserMutation.mutateAsync({
        data: data as UserMutationData,
        url
      });
    }
  }, [updateUserMutation, updateUserProjectsMutation, updateUserRolesMutation]);

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
  const { getOne: searchUser } = useResource<User>(
    'users',
    KEYCLOAK_API_PORT,
    false
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: searchedUser, isLoading, error } = searchUser({
    url: `/users/${searchQuery}`,
    queryOptions: {
      enabled: !!searchQuery,
      retry: 2
    }
  });

  const userNotFound = useMemo(() => {
    if (!error) return false;
    const apiError = error as { response?: { status: number; data?: { detail?: string } } };
    return (
      apiError?.response?.status === 404 &&
      typeof apiError?.response?.data?.detail === 'string' &&
      apiError.response.data.detail.includes('User not found')
    );
  }, [error]);

  const debounceSearchUser = useMemo(() =>
    debounce((query: string) => {
      setSearchQuery(query);
    }, 500),
    []
  );

  useEffect(() => {
    return () => debounceSearchUser.cancel();
  }, [debounceSearchUser]);

  return {
    searchedUser: searchedUser || null,
    searchLoading: isLoading,
    userNotFound,
    debounceSearchUser,
  };
};
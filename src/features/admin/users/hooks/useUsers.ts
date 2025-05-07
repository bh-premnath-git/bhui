import { useState, useEffect, useMemo, useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import type { User, UserMutationData } from '@/types/admin/user';
import { toast } from 'sonner';
import { KEYCLOAK_API_PORT } from '@/config/platformenv';

// Define the API response structure to match the server
export interface ApiUsersResponse {
  total: number;
  users: User[];
  pagination: {
    first: number;
    max_results: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Define the response structure that the components will use
export interface UsersResponse {
  users: User[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

interface UseUsersOptions {
  shouldFetch?: boolean;
  userId?: string;
  mutationsOnly?: boolean;
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
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
  // State to hold the transformed users data in the format expected by components
  const [usersResponse, setUsersResponse] = useState<UsersResponse>({ users: [] });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>(options.filters || {});
  
  // For queries - returns User objects - using 'any' here to handle various response formats
  const { getOne: getUser, getAll: getAllUsers } = useResource<any>(
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

  const { update: updateUserResource } = useResource<UserMutationData>(
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

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((term: string, filters: Record<string, any>) => {
      const newFilters = { ...filters };
      if (term.trim()) {
        newFilters.search = term;
      } else {
        delete newFilters.search;
      }
      setSearchFilters(newFilters);
    }, 500),
    []
  );

  // Update search term and trigger debounced search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    debouncedSearch(term, options.filters || {});
  }, [debouncedSearch, options.filters]);

  // Prepare API parameters, removing undefined values
  const prepareParams = useCallback(() => {
    const params: Record<string, any> = {
      // Set default values for pagination
      page: options.page || 1,
      pageSize: options.pageSize || 10,
    };

    // Add search filters
    Object.entries({ ...searchFilters }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = value;
      }
    });

    return params;
  }, [options.page, options.pageSize, searchFilters]);

  // List users
  const { data: usersData, isLoading, isFetching, isError } = !options.mutationsOnly 
    ? getAllUsers({
        url: '/users',
        queryOptions: {
          enabled: options.shouldFetch,
          retry: 2
        },
        params: prepareParams()
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
  const updateUserMutation = updateUserResource('/users', {
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

  // Transform API response to the format expected by components
  useEffect(() => {
    if (!usersData) {
      setUsersResponse({ users: [] });
      return;
    }

    // Handle the response based on its actual structure
    try {
      // API response format with users array and pagination
      if (usersData && typeof usersData === 'object' && 'users' in usersData && 'total' in usersData) {
        const apiResponse = usersData as any;
        setUsersResponse({
          users: apiResponse.users || [],
          totalCount: apiResponse.total,
          page: options.page || 1,
          pageSize: apiResponse.pagination?.max_results || options.pageSize || 10
        });
      } 
      // Handle case where it might be an array
      else if (Array.isArray(usersData)) {
        setUsersResponse({
          users: usersData.filter(user => typeof user === 'object' && user !== null) as User[],
          totalCount: usersData.length,
          page: options.page || 1,
          pageSize: options.pageSize || 10
        });
      }
      // Fallback for unexpected formats
      else {
        console.warn('Unexpected users data format:', usersData);
        setUsersResponse({ 
          users: [],
          totalCount: 0,
          page: options.page || 1,
          pageSize: options.pageSize || 10
        });
      }
    } catch (error) {
      console.error('Error processing users data:', error);
      setUsersResponse({ users: [] });
    }
  }, [usersData, options.page, options.pageSize]);

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

  const addUser = useCallback(async (user: UserMutationData) => {
    try {
      const response = await createUserMutation.mutateAsync({
        data: user
      });
      return { success: true, user: response };
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error };
    }
  }, [createUserMutation]);

  const updateUser = useCallback(async (id: string, userData: UserMutationData) => {
    try {
      await handleUpdateUser(id, userData);
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error };
    }
  }, [handleUpdateUser]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await updateUserMutation.mutateAsync({
        data: {} as UserMutationData,
        url: `/users/${id}`
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error };
    }
  }, [updateUserMutation]);

  return {
    users: usersResponse,
    user,
    searchTerm,
    handleSearch,
    isLoading: isLoading || false,
    isUserLoading: isUserLoading || false,
    isFetching: isFetching || false,
    isUserFetching: isUserFetching || false,
    isError: isError || false,
    isUserError: isUserError || false,
    handleCreateUser,
    handleUpdateUser,
    addUser,
    updateUser,
    deleteUser
  };
};
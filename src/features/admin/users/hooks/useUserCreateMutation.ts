import { useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import type { UserCreateData } from '@/types/admin/user';
import { toast } from 'sonner';
import { KEYCLOAK_API_REMOTE_URL } from '@/config/platformenv';

interface ApiErrorOptions {
  action: 'create';
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

export const useUserCreateMutation = () => {
  // For mutations - accepts UserCreateData specifically
  const { create: createUser } = useResource<UserCreateData>(
    'users',
    KEYCLOAK_API_REMOTE_URL,
    true
  );

  // Create user mutation
  const createUserMutation = createUser({
    url: '/bh-user/create-user',
    mutationOptions: {
      onSuccess: () => toast.success('User created successfully'),
      onError: (error) => {
        handleApiError(error, { action: 'create' });
        return Promise.reject(error);
      },
    },
  });

  // Type-safe mutation handler
  const handleCreateUser = useCallback(async (data: UserCreateData) => {
    await createUserMutation.mutateAsync({
      data
    });
  }, [createUserMutation]);

  return {
    handleCreateUser,
    isCreating: createUserMutation.isPending,
    createError: createUserMutation.error,
  };
};

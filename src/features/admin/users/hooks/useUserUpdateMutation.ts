import { useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import type { UserUpdateData } from '@/types/admin/user';
import { toast } from 'sonner';
import { KEYCLOAK_API_REMOTE_URL } from '@/config/platformenv';

interface ApiErrorOptions {
  action: 'update' | 'delete';
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

export const useUserUpdateMutation = () => {
  // For mutations - accepts UserUpdateData specifically
  const { update: updateUser, remove: removeUser } = useResource<UserUpdateData>(
    'users',
    KEYCLOAK_API_REMOTE_URL,
    true
  );

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
  const handleUpdateUser = useCallback(async (id: string, data: UserUpdateData) => {
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

  return {
    handleUpdateUser,
    handleDeleteUser,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    updateError: updateUserMutation.error,
    deleteError: deleteUserMutation.error,
  };
};

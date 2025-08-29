import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  // For mutations - accepts UserUpdateData specifically
  const {
    update: updateUser,
    remove: removeUser,
  } = useResource<UserUpdateData>(
    'users',
    KEYCLOAK_API_REMOTE_URL,
    true
  );

  // Update Mutation
  const updateUserMutation = updateUser('/bh-user/update-user/', {
    mutationOptions: {
      onSuccess: () => {
        toast.success('User updated successfully');
        // Invalidate user queries to fetch latest data
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
      onError: (error) => handleApiError(error, { action: 'update' }),
    },
  });

  // Delete Mutation
  const deleteUserMutation = removeUser('/bh-user/delete-user/', {
    mutationOptions: {
      onSuccess: () => {
        toast.success('User deleted successfully');
        // Invalidate user queries to fetch latest data
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
      onError: (error) => handleApiError(error, { action: 'delete' }),
    },
  });

  // Handlers
  const handleUpdateUser = useCallback(
    async (userEmail: string, data: UserUpdateData): Promise<void> => {
      await updateUserMutation.mutateAsync({
        url: `/bh-user/update-user/${userEmail}`,
        data,
      });
    },
    [updateUserMutation]
  );

  const handleDeleteUser = useCallback(
    async (userEmail: string): Promise<void> => {
      await deleteUserMutation.mutateAsync({
        url: `/bh-user/delete-user/${userEmail}`,
      });
    },
    [deleteUserMutation]
  );

  return {
    handleUpdateUser,
    handleDeleteUser,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    updateError: updateUserMutation.error,
    deleteError: deleteUserMutation.error,
  };
};

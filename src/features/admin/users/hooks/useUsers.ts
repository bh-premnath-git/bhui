import { useResource } from '@/hooks/api/useResource';
import type { 
  User,
  UserMutationData 
} from '@/types/admin/user';
import { toast } from 'sonner';
import { KEYCLOAK_API_PORT } from '@/config/platformenv';

interface UseUsersOptions {
  shouldFetch?: boolean;
  userId?: string;
}

/**
 * Hook for managing users data and operations
 */
export const useUsers = (options: UseUsersOptions = { shouldFetch: true }) => {
  const {
    getAll,
    getOne,
    createMutation,
    updateMutation,
    deleteMutation
  } = useResource<User>('users', KEYCLOAK_API_PORT, false);

  const { data: users, isLoading, isFetching, isError } = getAll('/users/');

  const { 
    data: user, 
    isLoading: isUserLoading, 
    isFetching: isUserFetching, 
    isError: isUserError 
  } = options.userId ? getOne(`/users/${options.userId}/`) : {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false
  };

  const handleCreateUser = async (data: UserMutationData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('User created successfully');
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error('Failed to create user');
      throw error;
    }
  };

  const handleUpdateUser = async (id: string, data: UserMutationData) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        url: `/users/${id}/`
      });
      toast.success('User updated successfully');
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error('Failed to update user');
      throw error;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({
        url: `/users/${id}/`
      });
      toast.success('User deleted successfully');
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error('Failed to delete user');
      throw error;
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
    handleUpdateUser,
    handleDeleteUser
  };
};

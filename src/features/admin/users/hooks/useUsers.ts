
import { useResource } from '@/hooks/api/useResource';
import type { 
  UsersPaginatedResponse,
  UserMutationData 
} from '@/types/admin/user';
import { toast } from 'sonner';
import { KEYCLOAK_API_PORT } from '@/config/platformenv';

interface UseUsersOptions {
  shouldFetch?: boolean;
}

export const useUsers = (options: UseUsersOptions = { shouldFetch: true }) => {
  const {
    getAll,
    createOne,
    updateOne,
    deleteOne
  } = useResource<UsersPaginatedResponse>('users', KEYCLOAK_API_PORT, false);

  const { data: users, isLoading, isFetching, isError } = getAll();
  
  const createMutation = createOne();
  const updateMutation = updateOne("placeholder-id");
  const deleteMutation = deleteOne("placeholder-id");

  const handleCreateUser = async (data: UserMutationData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('User created successfully');
    } catch (error) {
      toast.error('Failed to create user');
      throw error;
    }
  };

  const handleUpdateUser = async (id: string, data: UserMutationData) => {
    try {
      await updateMutation.mutateAsync({ id, ...data });
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
      throw error;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
      throw error;
    }
  };

  return {
    users,
    isLoading,
    isFetching,
    isError,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser
  };
};

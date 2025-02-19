import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { UserForm } from '@/features/admin/users/components/UserForm';
import { UserMutationData } from '@/types/admin/user';
import { useUsers } from '@/features/admin/users/hooks/useUsers';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';

export function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { handleUpdateUser, handleGetUser } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = handleGetUser(id);
  debugger
  const onSubmit = async (data: UserMutationData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (id) {
        await handleUpdateUser(id, data);
        navigate(ROUTES.ADMIN.USERS.INDEX);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      setError(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div className="p-6">User not found</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit User</h1>
          <p className="text-gray-600">Modify user details and access permissions</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.ADMIN.USERS.INDEX)}
        >
          View All Users
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <UserForm
          initialData={user}
          onSubmit={onSubmit}
          mode="edit"
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </div>
  );
}
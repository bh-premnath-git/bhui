import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UserForm } from '@/features/admin/users/components/UserForm';
import { UserMutationData } from '@/types/admin/user';
import { useUsers } from '@/features/admin/users/hooks/useUsers';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';

export function AddUser() {
  const navigate = useNavigate();
  const { handleCreateUser } = useUsers({ shouldFetch: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: UserMutationData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await handleCreateUser(data);
      navigate(ROUTES.ADMIN.USERS.INDEX);
    } catch (error) {
      console.error('Failed to create user:', error);
      setError(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-muted-foreground">Add a new user and configure their access permissions</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.ADMIN.USERS.INDEX)}
          >
            View All Users
          </Button>
        </div>
        
        <div className="bg-card rounded-lg shadow p-6">
          <UserForm
            onSubmit={onSubmit}
            mode="create"
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { RootState } from "@/store"
import { useAppSelector } from "@/hooks/uaeRedux"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { UserForm } from "./components/UserForm"
import { useUsers } from "./hooks/useUsers"
import { ROUTES } from '@/config/routes'
import type { UserMutationData } from "@/types/admin/user"
import { apiToUiRoles, uiToApiRoles } from "./components/FormFields"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"

export function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedUser } = useAppSelector((state: RootState) => state.users);
  const {
    handleUpdateUser,
    user: fetchedUser,
    isUserLoading,
    isUserError
  } = useUsers({ 
    userId: selectedUser?.id ? undefined : id, // Only fetch if we don't have selectedUser
  });
  
  // Use selectedUser if available, otherwise use fetched user
  const user = selectedUser || fetchedUser;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: UserMutationData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (id) {
        const submitData = {
          ...data,
          realm_roles: uiToApiRoles(data.realm_roles)
        };
        await handleUpdateUser(id, submitData);
        navigate(ROUTES.ADMIN.USERS.INDEX);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="p-6">
        <LoadingState className="w-40 h-40" />
      </div>
    );
  }

  if (isUserError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Error Loading User"
          description="There was an error loading the user. Please try again later."
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <ErrorState
          title="User Not Found"
          description="The requested user could not be found."
        />
      </div>
    );
  }

  // Transform API data to match form field names
  const formInitialData = user ? {
    ...user,
    realm_roles: apiToUiRoles(user.realm_roles),
  } : null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate(ROUTES.ADMIN.USERS.INDEX)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Edit User</h3>
          <p className="text-sm text-muted-foreground">
            Update user information and permissions
          </p>
        </div>

        <UserForm
          initialData={formInitialData}
          onSubmit={onSubmit}
          mode="edit"
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </div>
  );
}
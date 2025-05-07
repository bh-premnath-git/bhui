import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingState } from '@/components/shared/LoadingState';
import { ROUTES } from "@/config/routes";
import { UserForm } from "./components/UserForm";
import { useUsers } from "./hooks/useUsers";
import { useUserSearch } from "./hooks/useUserSearch";
import { UserPageLayout } from "./components/UserPageLayout";
import type { UserMutationData } from "@/types/admin/user";

export function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { handleUpdateUser, user, isUserLoading } = useUsers({ shouldFetch: true, userId: id });
  const { searchedUser, searchLoading, userNotFound, debounceSearchUser } = useUserSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: UserMutationData) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      if (data.projects) {
        await handleUpdateUser(id, { projects: data.projects }, 'projects');
      }
      if (data.realm_roles) {
        await handleUpdateUser(id, { realm_roles: data.realm_roles }, 'roles');
      }
      
      navigate(ROUTES.ADMIN.USERS.INDEX);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (firstName: string, lastName: string) => {
    if (firstName && lastName) {
      debounceSearchUser(`${firstName.toLowerCase()}${lastName.toLowerCase()}`);
    }
  };

  const handleClearSearch = () => {
    debounceSearchUser('');
  };

  if (isUserLoading) {
    return <LoadingState className="h-40 w-40" />;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  // Transform user data for form initialization
  const formInitialData: Partial<UserMutationData> = {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    enabled: user.enabled,
    projects: user.projects || [],
    realm_roles: user.realm_roles || [],
    username: user.username
  };

  return (
    <UserPageLayout
      description="Update user information and permissions"
    >
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <UserForm
            mode="edit"
            initialData={formInitialData}
            onSubmit={onSubmit}
            onNameChange={handleNameChange}
            onClearSearch={handleClearSearch}
            isSubmitting={isSubmitting}
            error={error}
            searchedUser={searchedUser}
            searchLoading={searchLoading}
            userNotFound={userNotFound}
          />
        </div>
      </div>
    </UserPageLayout>
  );
}
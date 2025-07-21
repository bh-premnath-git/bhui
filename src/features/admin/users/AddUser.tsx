import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { UserForm } from "./components/UserForm";
import { useUserCreateMutation } from "./hooks/useUserCreateMutation";
import { UserPageLayout } from "./components/UserPageLayout";
import type { UserCreateData } from "@/types/admin/user";

export function AddUser() {
  const navigate = useNavigate();
  const { handleCreateUser, isCreating, createError } = useUserCreateMutation();
  const [error, setError] = useState<string | null>(null);
  
  const onSubmit = async (data: UserCreateData) => {
    try {
      setError(null);
      await handleCreateUser(data);
      navigate(ROUTES.ADMIN.USERS.INDEX);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  return (
    <UserPageLayout description="Create a new user and assign their permissions">
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <UserForm
            onSubmit={onSubmit}
            mode="create"
            isSubmitting={isCreating}
            error={error || (createError ? String(createError) : null)}
          />
        </div>
      </div>
    </UserPageLayout>
  );
}
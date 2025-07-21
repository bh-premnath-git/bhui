import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { UserForm } from "./components/UserForm";
import { useUserCreateMutation } from "./hooks/useUserCreateMutation";
import { UserPageLayout } from "./components/UserPageLayout";
import type { UserCreateData } from "@/types/admin/user";
import type { UserCreateValues } from "./components/userFormSchema";

export function AddUser() {
  const navigate = useNavigate();
  const { handleCreateUser, isCreating, createError } = useUserCreateMutation();
  const [error, setError] = useState<string | null>(null);
  
  const onSubmit = async (data: UserCreateValues) => {
    try {
      setError(null);
      const payload = { ...data } as UserCreateData;
      if (payload.is_tenant_admin) {
        delete (payload as any).assignments;
      }
      await handleCreateUser(payload);
      navigate(ROUTES.ADMIN.USERS.INDEX);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  return (
    <UserPageLayout description="Create a new user and assign their permissions">
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <UserForm<UserCreateValues>
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

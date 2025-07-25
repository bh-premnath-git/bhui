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
      
      // Handle regular users with role assignments
      if (!payload.is_tenant_admin) {
        // Extract role matrix IDs from project and environment assignments
        const roleMatrixIds: string[] = [];
        
        // Process project assignments if they exist
        if (data.project_assignments?.length) {
          data.project_assignments.forEach(assignment => {
            if (assignment.roles?.length) {
              roleMatrixIds.push(...assignment.roles);
            }
          });
        }
        
        // Process environment assignments if they exist
        if (data.environment_assignments?.length) {
          data.environment_assignments.forEach(assignment => {
            if (assignment.roles?.length) {
              roleMatrixIds.push(...assignment.roles);
            }
          });
        }
        
        // Add deduplicated role IDs to payload
        if (roleMatrixIds.length > 0) {
          (payload as any).bh_role_matrix_ids = [...new Set(roleMatrixIds)];
        }
      }
      // For tenant admins, bh_role_matrix_ids will be set by UserForm
      
      // Remove form-specific fields that aren't part of the API payload
      delete (payload as any).project_assignments;
      delete (payload as any).environment_assignments;
      
      console.log('User creation payload:', payload);
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

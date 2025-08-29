import { useMemo } from "react";
import { useResource } from "@/hooks/api/useResource";
import type { RoleMatrixEntry } from "@/types/admin/roles";
import { KEYCLOAK_API_REMOTE_URL } from "@/config/platformenv";

interface UseRoleMatrixQueryOptions {
    role_name?: string;
    offset?: number;
    limit?: number;
    orderBy?: string;
    orderDesc?: boolean;
    enabled?: boolean;
    fetchAll?: boolean;
}

export interface ApiRoleMatrixResponse {
    total: number;
    next: boolean;
    prev: boolean;
    offset: number;
    limit: number;
    data: RoleMatrixEntry[];
}

/**
 * Fetch role matrix entries filtered by project or environment.
 * At least one of projectId or environmentId must be provided.
 */
export const useRoleMatrixQuery = (
    options: UseRoleMatrixQueryOptions,
) => {
    const {
        role_name,
        offset = 0,
        limit = 100,
        orderBy = "created_at",
        orderDesc = true,
        enabled = true,
        fetchAll = false,
    } = options;

    const { getAll } = useResource<RoleMatrixEntry>(
        "role-matrix",
        KEYCLOAK_API_REMOTE_URL,
        true,
    );

    const queryParams = useMemo(() => {
        const params: Record<string, string | number | boolean> = {
            offset,
            limit,
            order_by: orderBy,
            order_desc: orderDesc,
        };
        if (role_name && role_name.trim() !== '') {
            params.role_name = role_name;
        }
        
        return params;
    }, [role_name, offset, limit, orderBy, orderDesc]);

    const shouldFetch = enabled && (fetchAll || role_name !== undefined);
    
    const {
        data: response,
        isLoading,
        isFetching,
        isError,
    } = getAll<ApiRoleMatrixResponse>({
        url: "/module/role_matrix/list/",
        params: queryParams,
        queryOptions: {
            enabled: shouldFetch,
            retry: 2,
        },
    });

    return {
        roles: response?.data ?? [],
        total: response?.total ?? 0,
        offset: response?.offset ?? 0,
        limit: response?.limit ?? 0,
        prev: response?.prev ?? false,
        next: response?.next ?? false,
        isLoading,
        isFetching,
        isError,
    };
};

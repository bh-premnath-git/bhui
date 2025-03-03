"use client";

import { useResource } from "@/hooks/api/useResource";
import { CATALOG_API_PORT } from "@/config/platformenv";
import { useCallback } from "react";
import { toast } from "sonner";

interface useDatabaseOption {
  shouldFetch?: boolean;
  connectionId?: string;
  schema?: string;
  projectId?: string;
}

interface ApiErrorOptions {
  action: "create" | "update" | "delete" | "fetch";
  context?: string;
  silent?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
  const { action, context = "import data source", silent = false } = options;
  const errorMessage = `Failed to ${action} ${context}`;
  console.error(`${errorMessage}:`, error);
  if (!silent) {
    toast.error(errorMessage);
  }
  throw error;
};

export const useDatabase = (options: useDatabaseOption = { shouldFetch: true }) => {
  const { getOne, create: createImportSource } = useResource<string[]>(
    "import_db_catalog/connection_config",
    CATALOG_API_PORT,
    true
  );

  const fetchSchema = useCallback(
    async (connectionId: string): Promise<string[]> => {
      try {
        const response = await getOne({
          url: `/import_db_catalog/connection_config/${connectionId}/get-schemas`,
          queryOptions: {
            enabled: true,
            retry: 2,
          },
        }).refetch();

        return (response.data as unknown as string[]) || [];
      } catch (error) {
        console.error("Error fetching schemas:", error);
        return [];
      }
    },
    [getOne]
  );

  const fetchTable = useCallback(
    async (connectionId: string, schema: string): Promise<string[]> => {
      try {
        const response = await getOne({
          url: `/import_db_catalog/connection_config/${connectionId}/schemas/${schema}/tables`,
          queryOptions: {
            enabled: true,
            retry: 2,
          },
        }).refetch();

        return (response.data as unknown as string[]) || [];
      } catch (error) {
        console.error("Error fetching tables:", error);
        return [];
      }
    },
    [getOne]
  );

  const createImportSourceMutation = createImportSource({
    mutationOptions: {
      onSuccess: () => toast.success("Data source imported successfully!"),
      onError: (error) => handleApiError(error, { action: "create" }),
    },
  });

  const handleCreateImportSource = useCallback(
    async (connectionId: string, projectId: string, schema: string, createDescription: boolean, data: string[]) => {
      try {
        await createImportSourceMutation.mutateAsync({
          url: `/import_db_catalog/connection_config/${connectionId}/create_data_source`,
          data,
          params: {
            bh_project_id: projectId,
            create_description: createDescription,
            schema,
          },
        });
      } catch (error) {
        handleApiError(error, { action: "create", context: "data source creation" });
      }
    },
    [createImportSourceMutation]
  );

  return {
    fetchSchema,
    fetchTable,
    handleCreateImportSource,
  };
};

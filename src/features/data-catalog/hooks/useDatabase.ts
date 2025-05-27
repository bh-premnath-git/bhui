"use client";

import { apiService } from "@/lib/api/api-service";
import { CATALOG_REMOTE_API_URL } from "@/config/platformenv";
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
  const fetchSchema = useCallback(
    async (connectionId: string): Promise<string[]> => {
      if (!connectionId) return [];
      
      try {
        const response = await apiService.get<string[]>({
          baseUrl: CATALOG_REMOTE_API_URL,
          method: 'GET',
          url: `/import_db_catalog/connection_config/${connectionId}/get-schemas`,
          usePrefix: true
        });
        return response || [];
      } catch (error) {
        console.error("Error fetching schemas:", error);
        handleApiError(error, { action: "fetch", context: "database schemas", silent: true });
        return [];
      }
    },
    []
  );

  const fetchTable = useCallback(
    async (connectionId: string, schema: string): Promise<string[]> => {
      try {
        const response = await apiService.get<string[]>({
          baseUrl: CATALOG_REMOTE_API_URL,
          method: 'GET',
          url: `/import_db_catalog/connection_config/${connectionId}/schemas/${schema}/tables`,
          usePrefix: true
        });
        return response || [];
      } catch (error) {
        console.error("Error fetching tables:", error);
        return [];
      }
    },
    []
  );

  const handleCreateImportSource = useCallback(
    async (connectionId: string, projectId: string, schema: string, createDescription: boolean, identifyPII: boolean, data: string[]) => {
      try {
        await apiService.post({
          baseUrl: CATALOG_REMOTE_API_URL,
          method: 'POST',
          url: `/import_db_catalog/connection_config/${connectionId}/create_data_source`,
          usePrefix: true,
          data,
          params: {
            bh_project_id: projectId,
            create_description: createDescription,
            identify_pii_elements: identifyPII,  
            schema,
          }
        });
        toast.success("Data source imported successfully!");
      } catch (error) {
        handleApiError(error, { action: "create", context: "data source creation" });
      }
    },
    []
  );

  return {
    fetchSchema,
    fetchTable,
    handleCreateImportSource,
  };
};

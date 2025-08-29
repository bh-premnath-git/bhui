import { useResource } from "@/hooks/api/useResource";
import { DataSourceLayout } from "@/types/data-catalog/dataCatalog";
import { toast } from "sonner";
import { CATALOG_REMOTE_API_URL } from "@/config/platformenv";
import { useEffect } from "react";

interface UseLayoutFieldsOptions {
    shouldFetch: boolean;
    dataSourceId?: number;
}

export const useLayoutFields = (options: UseLayoutFieldsOptions = { shouldFetch: true }) => {
    // For queries - returns DataSourceLayout array which contains layout fields
    const { getAll: getAllLayoutFields } = useResource<DataSourceLayout>(
        'datasource_layout',
        CATALOG_REMOTE_API_URL,
        true
    );

    // List layout fields with data source filter
    const { data: layouts, isLoading, isFetching, isError, error, refetch } = getAllLayoutFields({
        url: '/data_source_layout/list_full/',
        params: options.dataSourceId ? { data_src_id: options.dataSourceId } : undefined,
        queryOptions: {
            enabled: options.shouldFetch && !!options.dataSourceId,
            retry: 2
        }
    });

    // Handle errors at the hook level
    useEffect(() => {
        if (error) {
            const errorMessage = 'Failed to fetch layout fields';
            console.error(`${errorMessage}:`, error);
            toast.error(errorMessage);
        }
    }, [error]);

    const layoutFields = layouts?.[0] || null;

    return {
        layoutFields,
        isLoading,
        isFetching,
        isError,
        refetch, 
    };    
};
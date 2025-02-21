import { useResource } from "@/hooks/api/useResource";
import { LayoutField } from "@/types/data-catalog/dataCatalog";
import { toast } from "sonner";
import { CATALOG_API_PORT } from "@/config/platformenv";    
import exp from "constants";
import { useParams } from "react-router-dom";

interface UseLayoutFieldsOptions {
    shouldFetch: boolean;
    dataSourceId?: number;
}

export const useLayoutFields = (options: UseLayoutFieldsOptions = { shouldFetch: true }) => {
    const {
        getAll,
    } = useResource<LayoutField>('/datasource_layout', CATALOG_API_PORT, true);

    const { data: layoutFields, isLoading, isFetching, isError } = getAll(
        '/data_source_layout/list_full/', 
        {
            data_src_id: options.dataSourceId
        }
    );

    return {
        layoutFields: layoutFields?.[0]?.layout_fields || [],
        isLoading,
        isFetching,
        isError,
    };    
};
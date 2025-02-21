import { useResource } from "@/hooks/api/useResource";
import { LayoutField } from "@/types/data-catalog/dataCatalog";
import { toast } from "sonner";
import { CATALOG_API_PORT } from "@/config/platformenv";    
import exp from "constants";
import { useParams } from "react-router-dom";

interface UseLayoutFieldsOptions {
    shouldFetch: boolean;
}

export const useLayoutFields = (options: UseLayoutFieldsOptions = { shouldFetch: true }) => {
    const {
        getAll,
    } = useResource<LayoutField>('datasource_layout', CATALOG_API_PORT, true);

    const { data: layoutFields, isLoading, isFetching, isError } = getAll('data_source_layout/list_full', {params: 'layout_id'});

    return {
        layoutFields,
        isLoading,
        isFetching,
        isError,
    };    
};
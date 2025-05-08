import { DataSource } from "@/types/data-catalog/dataCatalog";
import { useAppDispatch } from "@/hooks/useRedux";
import { setDatasources, setSelectedDatasource } from "@/store/slices/dataCatalog/datasourceSlice";

export interface DataCatalogManagementService {
    getDatasources(): Promise<DataSource[]>;
    selectDatasource(datasource: DataSource | null): Promise<DataSource | null>;
}

export const useDataCatalogManagementService = () => {
    const dispatch = useAppDispatch();
    return ({
        setDatasources: (datasources: any[]) => {
            dispatch(setDatasources(datasources));
        },
        selectDatasource: (datasource: DataSource | null) => {
            dispatch(setSelectedDatasource(datasource));
        }
    })
}
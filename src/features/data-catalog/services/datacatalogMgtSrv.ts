import { DataSource } from "@/types/data-catalog/dataCatalog";
import { useAppDispatch } from "@/hooks/uaeRedux";
import { setDatasources, setSelectedDatasource } from "@/store/slices/dataCatalog/datasource";

export interface DataCatalogManagementService {
    getDatasources(): Promise<DataSource[]>;
    selectDatasource(datasource: DataSource | null): Promise<DataSource | null>;
}

export const useDataCatalogManagementService = () => {
    const dispatch = useAppDispatch();
    return ({
        setDatasources: (datasources: DataSource[]) => {
            dispatch(setDatasources(datasources));
        },
        selectDatasource: (datasource: DataSource | null) => {
            dispatch(setSelectedDatasource(datasource));
        }
    })
}
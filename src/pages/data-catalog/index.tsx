import { useEffect } from "react";
import { DataSourcesTable } from "@/features/data-catalog/datacatalog/DataSourcesTable";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAppDispatch } from '@/hooks/useRedux';
import { setDataSources } from '@/store/features/dataSourcesSlice';
import { getDataSources } from "@/api/get-methods";

const DataCatalog = () => {
  const dispatch = useAppDispatch();
  const { data: dataSources, error, isLoading } = getDataSources.dataSources();

  useEffect(() => {
    if (dataSources) {
      dispatch(setDataSources(dataSources));
    }
  }, [dataSources, dispatch]);

  if (isLoading) return <LoadingState className='w-full min-h-screen' />;
  if (error) return <ErrorState message="Failed to load data sources" />;

  return (
    <div className="container space-y-6">
      <DataSourcesTable
        data={dataSources || []} />
    </div>
  );
};

export default DataCatalog;
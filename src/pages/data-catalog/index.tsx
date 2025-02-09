import { useEffect } from "react";
import { DataSourcesTable } from "@/features/data-catalog/datacatalog/DataSourcesTable";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAppDispatch } from '@/hooks/useRedux';
import { setDataSources } from '@/store/features/dataSourcesSlice';
import { getDataSources } from "@/api/get-methods";
import { DatabaseZap } from "lucide-react";

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

  if (dataSources.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="Welcome to Your Data Catalog !"
          description="Ready to manage your data sources."
          Icon={DatabaseZap}
        />
      </div>
    );
  }

  return (
    <div className="container space-y-6">
      <DataSourcesTable
        data={dataSources || []} />
    </div>
  );
};

export default DataCatalog;
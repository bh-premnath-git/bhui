import { useEffect } from 'react';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { DataCatalog } from '@/features/data-catalog/DataCatalog';
import { useDataCatalogManagementService } from '@/features/data-catalog/services/datacatalogMgtSrv';
import { LoadingState } from '@/components/shared/LoadingState';
import { usedatasource } from '@/features/data-catalog/hooks/usedataCatalog';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Database  } from 'lucide-react';

function DataCatalogPage() {
    const { datasource, isLoading, isFetching, isError } = usedatasource();
    const dataCatalogSrv = useDataCatalogManagementService();
    useEffect(() => {
        if(datasource && datasource.length > 0){
            dataCatalogSrv.setDatasources(datasource);
        }
    }, []);

    if (isError) return <ErrorState message="Something went wrong" />;

    if (isLoading) {
        return (
          <div className="p-6">
            <TableSkeleton />
          </div>
        );
      }

      if (datasource?.length === 0) {
        return (
          <div className="p-6">
            <EmptyState
              title="Welcome to Your Data Catalog!"
              description="Ready to manage your data."
              Icon={Database}
            />
          </div>
        );
      }

    return (
        <div className="p-6">
            <div className="relative">
                {isFetching && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <LoadingState className='w-40 h-40' />
                  </div>
                )}
                <DataCatalog datasources={datasource || []} />
            </div>
        </div>
        
    );
}

export default withPageErrorBoundary(DataCatalogPage, 'DataCatalog');
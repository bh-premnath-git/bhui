import { useEffect } from 'react';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { DataCatalog } from '@/features/data-catalog/DataCatalog';
import { useDataCatalogManagementService } from '@/features/data-catalog/services/datacatalogMgtSrv';
import { LoadingState } from '@/components/shared/LoadingState';
import { useDataCatalog } from '@/features/data-catalog/hooks/usedataCatalog';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Database  } from 'lucide-react';

function DataCatalogPage() {
    const { datasources, isLoading, isFetching, isError, refetch } = useDataCatalog({
      shouldFetch: true
    });
    const dataCatalogSrv = useDataCatalogManagementService();
    
    useEffect(() => {
        if(datasources && datasources.length > 0){
            dataCatalogSrv.setDatasources(datasources);
        }
    }, [datasources, dataCatalogSrv]);

    if (isError) return <ErrorState message="Something went wrong" />;

    if (isLoading || !datasources) {
        return (
          <div className="p-6">
            <TableSkeleton />
          </div>
        );
    }

    if (datasources.length === 0) {
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
                <DataCatalog 
                  datasources={datasources} 
                  onRefetch={refetch}
                />
            </div>
        </div>
    );
}

export default withPageErrorBoundary(DataCatalogPage, 'DataCatalog');
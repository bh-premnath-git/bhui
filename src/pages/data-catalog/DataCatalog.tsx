import { useEffect, useState } from 'react';
import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import { DataCatalog } from '@/features/data-catalog/DataCatalog';
import { useDataCatalogManagementService } from '@/features/data-catalog/services/datacatalogMgtSrv';
import { LoadingState } from '@/components/shared/LoadingState';
import { useDataCatalog } from '@/features/data-catalog/hooks/usedataCatalog';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Database } from 'lucide-react';

function DataCatalogPage() {
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    datasources,
    isLoading,
    isFetching,
    isError,
    refetch,
    total,
    next,
    prev
  } = useDataCatalog({
    shouldFetch: true,
    limit: pageSize,
    offset: offset
  });
  const dataCatalogSrv = useDataCatalogManagementService();

  useEffect(() => {
    if (datasources && datasources.length > 0) {
      dataCatalogSrv.setDatasources(datasources);
    }
  }, [datasources, dataCatalogSrv]);

  if (isError) return <ErrorState message="Something went wrong" />;

  const pageIndex = Math.floor(offset / pageSize);

  const handlePageChange = (page: number) => {
    const currentPageIndex = pageIndex;
    if (page > currentPageIndex && next) {
      setOffset(o => o + pageSize);
    } else if (page < currentPageIndex && prev) {
      setOffset(o => Math.max(0, o - pageSize));
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setOffset(0);
  };

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
          <LoadingState fullScreen />
        )}
        <DataCatalog
          datasources={datasources}
          onRefetch={refetch}
          pageCount={Math.ceil((total || 0) / pageSize)}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          hasNextPage={next}
          hasPreviousPage={prev}
        />
      </div>
    </div>
  );
}

export default withPageErrorBoundary(DataCatalogPage, 'DataCatalog');
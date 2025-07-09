import { useEffect, useState } from 'react';
import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import { DataCatalog } from '@/features/data-catalog/DataCatalog';
import { useDataCatalogManagementService } from '@/features/data-catalog/services/datacatalogMgtSrv';
import { LoadingState } from '@/components/shared/LoadingState';
import { useNavigation } from '@/hooks/useNavigation';
import { useDataCatalog } from '@/features/data-catalog/hooks/usedataCatalog';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Database } from 'lucide-react';

function DataCatalogPage() {
  const { handleNavigation } = useNavigation();
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
  const { projects } = useProjects();
  const dispatch = useAppDispatch();
  const { handleNavigation } = useNavigation();

  const gitProjectList = Array.isArray(projects) ? projects.map((project: any) => ({
    ProjectId: project.bh_project_id,
    Project_Name: project.bh_project_name
  })) : [];

  const handleFlatFileImport = () => {
    setShowImportSection(true);
  };

  const handleTablesImport = () => {
    handleNavigation(`${ROUTES.DATA_CATALOG}/datasource-import`);
  };

  const closeImportSection = () => {
    setShowImportSection(false);
    dispatch(getSource());
    refetch(); // Refresh data after import
  };

  useEffect(() => {
    if (datasources && datasources.length > 0) {
      dataCatalogSrv.setDatasources(datasources);
    }
  }, [datasources, dataCatalogSrv]);

   useEffect(() => {
      const handleOpenImportSource = () => {
        handleNavigation(`${ROUTES.DATA_CATALOG}/datasource-import`);
      };
      
      const handleImportClick = () => {
        setShowImportSection(!showImportSection);
      };
  
      window.addEventListener("openImportSourceDialog", handleOpenImportSource);
      window.addEventListener("openLocalImport", handleImportClick);
  
      return () => {
        window.removeEventListener("openImportSourceDialog", handleOpenImportSource);
        window.removeEventListener("openLocalImport", handleImportClick);
      }
    }, [handleNavigation]);

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
            {isFetching && <LoadingState fullScreen />}
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
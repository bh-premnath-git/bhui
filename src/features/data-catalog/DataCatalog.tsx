import { useState, useEffect } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './config/columns.config';
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { useDataCatalogManagementService } from '@/features/data-catalog/services/datacatalogMgtSrv';
import { CatalagSlideWrapper } from './components/CatalagSlideWrapper';
import { ROUTES } from '@/config/routes';

interface DataCatalogProps {
  datasources: any[];
  onRefetch: () => void;
}

export function DataCatalog({ datasources, onRefetch }: DataCatalogProps) {
  const { handleNavigation } = useNavigation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataSource | undefined>();
  const dataCatalogSrv = useDataCatalogManagementService();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Calculate total count from datasources array
  const totalCount = datasources?.length || 0;
  
  // Calculate the start and end indices for the current page
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  
  // Slice the data for the current page
  const currentPageData = datasources.slice(startIndex, endIndex);

  const onRowClickHandler = (row: Row<DataSource>) => {
    console.log(row.original);
    setSelectedRow(row.original);
    setIsSheetOpen(true);
    dataCatalogSrv.selectDatasource(row.original);
  }

  const handlePageChange = (page: number) => {
    setPageIndex(page - 1);
    // If you need to fetch new data from API
    if (onRefetch) {
      onRefetch();
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page when changing page size
    // If you need to fetch new data from API
    if (onRefetch) {
      onRefetch();
    }
  };

  // Refetch data when sheet is closed
  useEffect(() => {
    if (!isSheetOpen && onRefetch) {
      onRefetch();
    }
  }, [isSheetOpen, onRefetch]);

  useEffect(() => {
    const handleOpenImportSource = () => {
      handleNavigation(`${ROUTES.DATA_CATALOG}/datasource-import`);
    };
    const handleOpenXplore = () => {
      handleNavigation(`${ROUTES.DATA_CATALOG}/xplorer`);
    };

    window.addEventListener("openImportSourceDialog", handleOpenImportSource);
    window.addEventListener("openXploreDialog", handleOpenXplore);

    return () => {
      window.removeEventListener("openImportSourceDialog", handleOpenImportSource);
      window.removeEventListener("openXploreDialog", handleOpenXplore);
    }
  }, [handleNavigation]);

  return (
    <>
      <DataTable<DataSource>
        columns={columns}
        data={currentPageData}
        topVariant="simple"
        pagination={true}
        toolbarConfig={getToolbarConfig()}
        onRowClick={onRowClickHandler}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={Math.ceil(totalCount / pageSize)}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <CatalagSlideWrapper 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedRow={selectedRow}
      />
    </>
  );
}

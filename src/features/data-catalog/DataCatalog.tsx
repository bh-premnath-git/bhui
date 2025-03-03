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

  const onRowClickHandler = (row: Row<DataSource>) => {
    setSelectedRow(row.original);
    setIsSheetOpen(true);
    dataCatalogSrv.selectDatasource(row.original);
  }

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
        data={datasources || []}
        topVariant="simple"
        pagination={true}
        toolbarConfig={getToolbarConfig()}
        onRowClick={onRowClickHandler}
      />
      <CatalagSlideWrapper 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        selectedRow={selectedRow}
      />
    </>
  );
}

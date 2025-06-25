import { useState, useEffect } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { useDataCatalogManagementService } from '@/features/data-catalog/services/datacatalogMgtSrv';
import { ROUTES } from '@/config/routes';
import { getSource } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { useAppDispatch } from '@/hooks/useRedux';
import { useProjects } from '@/features/admin/projects/hooks/useProjects';
import ImportDataSourceStepper from '@/features/data-catalog/components/ImportDataSourceWizard';
import { columns, getToolbarConfig } from '@/features/data-catalog/config/columns.config';
import { CatalagSlideWrapper } from '@/features/data-catalog/components/CatalagSlideWrapper';

interface DataCatalogProps {
  datasources: DataSource[];
  onRefetch: () => void;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function DataCatalog({ 
  datasources, 
  onRefetch,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPreviousPage
}: DataCatalogProps): any {
  const { handleNavigation } = useNavigation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataSource | undefined>();
  const dataCatalogSrv = useDataCatalogManagementService();
  const [showImportSection, setShowImportSection] = useState(false);
  const { projects } = useProjects();
  const dispatch = useAppDispatch();

  const gitProjectList = Array.isArray(projects) ? projects.map((project: any) => ({
    ProjectId: project.bh_project_id,
    Project_Name: project.bh_project_name
  })) : [];

  const onRowClickHandler = (row: Row<DataSource>) => {
    setSelectedRow(row.original);
    setIsSheetOpen(true);
    dataCatalogSrv.selectDatasource(row.original);
  }

  const closeImportSection = () => {
    setShowImportSection(false);
    dispatch(getSource());
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
  
 
  
  return (
    <>
     {showImportSection ? (
      <ImportDataSourceStepper gitProjectList={gitProjectList} closeImportSection={closeImportSection} />
     ): (
      <>
      <DataTable<DataSource>
        columns={columns}
        data={datasources}
        topVariant="simple"
        pagination={true}
        toolbarConfig={getToolbarConfig()}
        onRowClick={onRowClickHandler}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={pageCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
      </>
     )}
     {isSheetOpen && selectedRow && (
        <CatalagSlideWrapper 
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          selectedRow={selectedRow}
        />
      )}
    </>
  );
}
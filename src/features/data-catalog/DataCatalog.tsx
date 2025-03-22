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
  datasources: any[];
  onRefetch: () => void;
}

export function DataCatalog({ datasources, onRefetch }: DataCatalogProps): any {
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
    setSelectedRow(row.original);
    setIsSheetOpen(true);
    dataCatalogSrv.selectDatasource(row.original);
  }

  const closeImportSection = () => {
    setShowImportSection(false);
    dispatch(getSource());
  }; 

  const handlePageChange = (page: number) => {
    setPageIndex(page - 1);
    // If you need to fetch new data from API
    if (onRefetch) {
      onRefetch();
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); 
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

    const handleOpenNotebook = () => {
      handleNavigation(`${ROUTES.DATA_CATALOG}/notebook`);
    };

    const handleImportClick = () => {
      setShowImportSection(!showImportSection);
    };

    window.addEventListener("openImportSourceDialog", handleOpenImportSource);
    window.addEventListener("openXploreDialog", handleOpenXplore);
    window.addEventListener("openLocalImport", handleImportClick);
    window.addEventListener("openNotebookDialog", handleOpenNotebook);

    return () => {
      window.removeEventListener("openImportSourceDialog", handleOpenImportSource);
      window.removeEventListener("openXploreDialog", handleOpenXplore);
      window.removeEventListener("openLocalImport", handleImportClick);
      window.removeEventListener("openNotebookDialog", handleOpenNotebook);
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
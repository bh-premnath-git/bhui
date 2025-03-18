import { useState, useEffect } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './config/columns.config';
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { useDataCatalogManagementService } from '@/features/data-catalog/services/datacatalogMgtSrv';
import { CatalagSlideWrapper } from './components/CatalagSlideWrapper';
import { ROUTES } from '@/config/routes';
import ImportDataSourceStepper from './components/ImportDataSourceWizard';
import { useProjects } from '../admin/projects/hooks/useProjects';
import { getSource } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { useAppDispatch } from '@/hooks/useRedux';

interface DataCatalogProps {
  datasources: any[];
  onRefetch: () => void;
}

export function DataCatalog({ datasources, onRefetch }: DataCatalogProps) {
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
    console.log(row.original);
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
  const handleImportClick = () => {
    setShowImportSection(!showImportSection);
  };
  return (
    <>
     {showImportSection ? (
      <ImportDataSourceStepper gitProjectList={gitProjectList} closeImportSection={closeImportSection} />
     ): (
      <>
      <DataTable<DataSource>
        columns={columns}
        data={datasources || []}
        topVariant="simple"
        pagination={true}
        toolbarConfig={getToolbarConfig()}
        onRowClick={onRowClickHandler}
        importSrcFn={handleImportClick}
      />
      </>
     )}
    </>
  );
}

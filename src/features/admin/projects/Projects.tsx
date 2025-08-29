import { useCallback } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './config/columns.config';
import { Project } from '@/types/admin/project';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { useProjectManagementServive } from '@/features/admin/projects/services/projMgtSrv';

interface ProjectsListProps {
  projects: Project[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function ProjectsList({ projects, pageCount, pageIndex, pageSize, onPageChange, onPageSizeChange, hasNextPage, hasPreviousPage }: ProjectsListProps) {
  const { handleNavigation } = useNavigation()
  const projMgntSrv = useProjectManagementServive();

  const onRowClickHandler = useCallback((row: Row<Project>) => {
    projMgntSrv.selectatedProject(row.original);
    handleNavigation(ROUTES.ADMIN.PROJECTS.EDIT(row.original.bh_project_id.toString()));
  }, [projMgntSrv, handleNavigation]);

  return (
    <DataTable<Project>
      columns={columns}
      data={projects || []}
      topVariant="simple"
      onRowClick={onRowClickHandler}
      toolbarConfig={getToolbarConfig()}
      pageCount={pageCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
    />
  );
}

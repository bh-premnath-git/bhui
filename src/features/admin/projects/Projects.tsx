import { useCallback } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './config/columns.config';
import { Project } from '@/types/admin/project';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { useProjectManagementServive } from '@/features/admin/projects/services/projMgtSrv';

export function ProjectsList({ projects }: { projects: Project[] }) {
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
      pagination={true}
      onRowClick={onRowClickHandler}
      toolbarConfig={getToolbarConfig()}
    />
  );
}


import { DataTable } from '@/components/bh-table/data-table';
import { columns } from './config/columns.config';
import { Project } from '@/types/admin/project';

export function ProjectsList({ projects }: { projects: Project[] }) {


  return (
      <DataTable<Project>
        columns={columns}
        data={projects || []}
        topVariant="simple"
        pagination={true}

      />
  );
}

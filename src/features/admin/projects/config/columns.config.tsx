import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { Project } from '@/types/admin/project';
import { Badge } from '@/components/ui/badge';

const columnHelper = createColumnHelper<Project>();

export const columns: ColumnDef<Project>[] = [
  columnHelper.accessor('bh_project_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('bh_github_provider', {
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('bh_github_provider') as number;
      return (
        <Badge variant="outline">
          {type}
        </Badge>
      );
    },
    enableColumnFilter: true,
  }),
];

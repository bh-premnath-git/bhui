import { createColumnHelper } from '@tanstack/react-table';
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { Project } from '@/types/admin/project';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/config/routes';
import { useNavigation } from '@/hooks/useNavigation';
import { PlusIcon, FolderGit2 } from 'lucide-react';


const columnHelper = createColumnHelper<Project>();

export const columns: ColumnDefWithFilters<Project>[] = [
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

export const getToolbarConfig = (): TToolbarConfig => {
  const { handleNavigation } = useNavigation()
  return {
    buttons: [
      {
        label: <FolderGit2 className="mr-2 h-4 w-4" />,
        variant: "outline",
        icon: PlusIcon,
        onClick: () => {
          handleNavigation(ROUTES.ADMIN.PROJECTS.ADD)
        },
      }]
  }

}

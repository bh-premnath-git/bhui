import { Project } from '@/types/project.types';
import { DataTable } from "@/components/bh-table/data-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { CustomToolbarConfig } from "@/types/data-table.types";
import { PlusIcon } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { getUniqueValues } from '@/lib/utils';
import _ from 'lodash';
import { Button } from '@/components/ui';
import { DotsVerticalIcon } from '@radix-ui/react-icons';

interface ProjectTableProps {
  projects: Project[]
}

export const ProjectTable = ({ projects }: ProjectTableProps) => {
  const navigate = useNavigate()

  const tableName: string = "projects"
  const columns: ColumnDefWithFilters<Project>[] = [
    {
      accessorKey: 'bh_project_name',
      header: 'Name',
      filterOptions: getUniqueValues(projects, 'bh_project_name')
    },
    {
      accessorKey: 'ytd_cost',
      header: 'YTD_Cost ($)',
    },
    {
      accessorKey: 'current_month_cost',
      header: 'Current_Month_Cost ($)',
    },
    {
      accessorKey: 'total_storage',
      header: 'Total Storage (GB)',
    },
    {
      accessorKey: 'total_data_sources',
      header: 'Total Data Sources',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.original.status === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {_.startCase(row.original.status as string)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-red-600">Delete Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];
  const customToolbarConfig: CustomToolbarConfig = {
    buttons: [
      {
        label: "Add Project",
        icon: PlusIcon,
        variant: "default",
        onClick: () => navigate("/admin-console/projects/add"),
      },
    ],
  };
  const rowClickHandler = (row: Row<Project>) => {
    navigate(`/admin-console/projects/${row.original.id}`);
  }
  return <DataTable
    tableName={tableName}
    customToolbarConfig={customToolbarConfig}
    columns={columns} data={projects} showToolbar={true}
    onRowClick={rowClickHandler}
  />;
};
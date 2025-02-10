import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import { Project } from '@/types/project.types';
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { CustomToolbarConfig } from "@/types/data-table.types";
import { getUniqueValues } from '@/lib/utils';

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
    navigate(`/admin-console/projects/${row.original.bh_project_id}`);
  }
  return <DataTable
    tableName={tableName}
    customToolbarConfig={customToolbarConfig}
    columns={columns} data={projects} showToolbar={true}
    onRowClick={rowClickHandler}
  />;
};
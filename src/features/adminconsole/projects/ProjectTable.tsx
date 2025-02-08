import { Project } from '@/types/project.types';
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { CustomToolbarConfig } from "@/types/data-table.types";
import { PlusIcon } from 'lucide-react';

interface ProjectTableProps {
  projects: Project[]
}

export const ProjectTable = ({ projects }: ProjectTableProps) => {
  const tableName: string = "projects"
  const columns: ColumnDefWithFilters<Project>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.original.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
          }`}>
          {row.original.status}
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
        onClick: () => console.log("Custom Add User clicked"),
      },
    ],
  };
  return <DataTable 
  tableName={tableName}
  customToolbarConfig={customToolbarConfig}
  columns={columns} data={projects} showToolbar={true} />;
};
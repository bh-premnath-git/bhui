import { Environment } from '@/types/environment.types';
import { DataTable } from "@/components/bh-table/data-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { CustomToolbarConfig } from "@/types/data-table.types";
import { getUniqueValues } from "@/lib/utils";
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

interface EnvironmentTableProps {
  environments: Environment[]
}

export const EnvironmentTable = ({ environments }: EnvironmentTableProps) => {
  const navigate = useNavigate()
  const tableName: string = "environments"

  const columns: ColumnDefWithFilters<Environment>[] = [
    {
      accessorKey: "bh_env_name",
      header: "Name",
      filterOptions: getUniqueValues(environments, 'bh_env_name')
    },
    {
      accessorKey: "cloud_provider_name",
      header: "Cloud Provider",
      filterOptions: getUniqueValues(environments, 'cloud_provider_name')
    },
    {
      accessorKey: "bh_env_provider_name",
      header: "Type",
      filterOptions: getUniqueValues(environments, 'bh_env_provider_name')
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.original.status === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
        }`}>
        {_.startCase(row.original.status as string)}
      </span>
      )
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
              <DropdownMenuItem className="text-red-600">Delete Environment</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },

  ]
  const customToolbarConfig: CustomToolbarConfig = {
    buttons: [
      {
        label: "Add Environment",
        icon: PlusIcon,
        variant: "default",
        onClick: () => {
          navigate("/admin-console/environment/add")
        },
      },
    ],
  };

  const rowClickHandler = (row: Row<Environment>) => {
    navigate(`/admin-console/environment/${row.original.id}`);
  }

  return <DataTable
    tableName={tableName}
    customToolbarConfig={customToolbarConfig}
    columns={columns} data={environments} showToolbar={true}
    onRowClick={rowClickHandler}
  />;
};
import { Environment } from '@/types/environment.types';
import { DataTable } from "@/components/bh-table/data-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { CustomToolbarConfig } from "@/types/data-table.types";
import { getUniqueValues } from "@/lib/utils";
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DotsVerticalIcon } from '@radix-ui/react-icons';

interface EnvironmentTableProps {
  environments: Environment[]
}

export const EnvironmentTable = ({ environments }: EnvironmentTableProps) => {
  const tableName: string = "environments"

  const columns: ColumnDefWithFilters<Environment>[] = [
    {
      accessorKey: "name",
      header: "Name",
      filterOptions: getUniqueValues(environments, 'name')
    },
    {
      accessorKey: "cloud_provider",
      header: "Cloud Provider",
      filterOptions: getUniqueValues(environments, 'cloud_provider')
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: "actions",
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
        onClick: () => console.log("Custom Add User clicked"),
      },
    ],
  };

  return <DataTable
    tableName={tableName}
    customToolbarConfig={customToolbarConfig}
    columns={columns} data={environments} showToolbar={true} />;
};
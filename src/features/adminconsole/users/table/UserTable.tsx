import { User } from '@/types/user.types';
import { DataTable } from "@/components/bh-table/data-table";
import { Button } from "@/components/ui/button"
import { CustomToolbarConfig } from "@/types/data-table.types";
import { getUniqueValues } from "@/lib/utils";
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { PlusIcon } from 'lucide-react';
import { DotsVerticalIcon } from "@radix-ui/react-icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface UserTableProps {
  data: User[];
}

export const UserTable = ({ data }: UserTableProps) => {
  const columns: ColumnDefWithFilters<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-sm font-medium">
            {row.original.initials}
          </div>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
          </div>
        </div>
      ),
      filterOptions: getUniqueValues(data, 'name'),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      filterOptions: getUniqueValues(data, 'email'),
    },
    {
      accessorKey: 'projects',
      header: 'Projects',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.projects.map((project, index) => (
            <Badge key={index} variant="outline">
              {project}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role, index) => (
            <Badge key={index} variant="outline">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === "Active" ? "default" : "destructive"}>
          {row.getValue("status")}
        </Badge>
      ),
      filterOptions: getUniqueValues(data, 'status'),
    },
    {
      accessorKey: 'created',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.getValue('created')), 'yyyy-MM-dd'),
    },
    {
      accessorKey: 'lastActive',
      header: 'Last Active',
      cell: ({ row }) => format(new Date(row.getValue('lastActive')), 'yyyy-MM-dd'),
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
              <DropdownMenuItem className="text-red-600">Delete user</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];

  const customToolbarConfig: CustomToolbarConfig = {
    buttons: [
      {
        label: "Add User",
        icon: PlusIcon,
        variant: "default",
        onClick: () => console.log("Add User clicked"),
      },
    ],
  };

  const tableName: string = "user";

  return (
    <DataTable
      columns={columns}
      data={data}
      customToolbarConfig={customToolbarConfig}
      showToolbar={true}
      tableName={tableName}
    />
  );
};

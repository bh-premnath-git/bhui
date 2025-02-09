import { User } from '@/types/user.types';
import { DataTable } from "@/components/bh-table/data-table";
import { Button } from "@/components/ui/button"
import { CustomToolbarConfig } from "@/types/data-table.types";
import { getUniqueValues, getInitials } from "@/lib/utils";
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { PlusIcon } from 'lucide-react';
import { DotsVerticalIcon } from "@radix-ui/react-icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

interface UserTableProps {
  data: User[];
}

export const UserTable = ({ data }: UserTableProps) => {
  const navigate = useNavigate()
  const columns: ColumnDefWithFilters<User>[] = [
    {
      accessorKey: 'username',
      header: 'Name',
      filterOptions: getUniqueValues(data, 'username'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-sm font-medium">
            {getInitials(row.getValue("username"))}
          </div>
          <div>
            <div className="font-medium">{row.getValue("username")}</div>
          </div>
        </div>
      ),
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
      accessorKey: 'realm_roles',
      header: 'Roles',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.realm_roles.map((role, index) => (
            <Badge key={index} variant="outline">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'emailVerified',
      header: 'Status',
      filterOptions: getUniqueValues(data, 'emailVerified'),
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.getValue("emailVerified") ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
        {_.startCase(row.getValue("emailVerified") ? "active" : "inactive" as string)}
      </span>
      ),
    },

    {
      id: "actions",
      header: 'Actions',
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
        onClick: () => {
          navigate("/admin-console/users/add");
        },
      },
    ],
  };

  const tableName: string = "user";

  const rowClickHandler = (row: Row<User>) => {
    navigate(`/admin-console/users/${row.original.id}`);
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      customToolbarConfig={customToolbarConfig}
      showToolbar={true}
      tableName={tableName}
      onRowClick={rowClickHandler}
    />
  );
};

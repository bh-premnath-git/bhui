import _ from 'lodash';
import { PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Row } from '@tanstack/react-table';
import { User } from '@/types/features/user/types';
import { DataTable } from "@/components/bh-table/data-table";
import { CustomToolbarConfig } from "@/types/data-table.types";
import { getUniqueValues, getInitials } from "@/lib/utils";
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from '@/hooks/useRedux';
import { setSingleUser } from '@/store/features/manageUserSlice';

interface UserTableProps {
  data: User[];
}

export const UserTable = ({ data }: UserTableProps) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
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
    dispatch(setSingleUser(row.original))
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

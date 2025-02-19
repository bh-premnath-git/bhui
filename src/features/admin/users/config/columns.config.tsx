import { createColumnHelper } from "@tanstack/react-table"
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { ROUTES } from '@/config/routes';
import { PlusIcon, Users } from 'lucide-react';
import { User } from '@/types/admin/user';
import { Badge } from "@/components/ui/badge";
import { getInitials } from '@/lib/utils';
import { useNavigation } from "@/hooks/useNavigation";

const columnHelper = createColumnHelper<User>()

const columns: ColumnDefWithFilters<User, any>[] = [
  columnHelper.accessor('username', {
    header: 'Name',

    cell: (info) => {
      const intials = getInitials(info.getValue())
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">{intials}</div>
          <div>{info.getValue()}</div>
        </div>
      )
    },
    enableColumnFilter: true,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('realm_roles', {
    header: 'Role',
    cell: (info) => {
      return (
        <div className="flex flex-wrap gap-1">
          {info.row.original.realm_roles.map((role: string, index: number) => (
            <Badge key={index} variant="outline">
              {role}
            </Badge>
          ))}
        </div>
      )
    },
    enableColumnFilter: false,
  }),
  columnHelper.accessor('emailVerified', {
    header: 'Status',
    cell: (info) => {
      return (
        <Badge className={info.getValue() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {info.getValue() ? "Active" : "Inactive"}
        </Badge>
      )
    },
    enableColumnFilter: false,
  }),
];

const getToolbarConfig = (): TToolbarConfig => {
  const { handleNavigation } = useNavigation()
  return {
    buttons: [
      {
        label: <Users className="mr-2 h-4 w-4" />,
        variant: "outline",
        icon: PlusIcon,
        onClick: () => {
          handleNavigation(ROUTES.ADMIN.USERS.ADD)
        },
      }]
  }

}

export { columns, getToolbarConfig }
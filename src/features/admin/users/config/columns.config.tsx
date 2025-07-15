import { createColumnHelper } from "@tanstack/react-table"
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { ROUTES } from '@/config/routes';
import { PlusIcon, Users } from 'lucide-react';
import { User } from '@/types/admin/user';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from '@/lib/utils';
import { useNavigation } from "@/hooks/useNavigation";

const columnHelper = createColumnHelper<User>()

const columns: ColumnDefWithFilters<User>[] = [
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
  columnHelper.accessor('emailVerified', {
    header: 'Status',
    cell: (info) => {
      return (
        <Badge 
          variant="outline"
          className={info.getValue() 
            ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:text-green-900" 
            : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 hover:text-red-900"
          }
        >
          {info.getValue() ? "Active" : "Inactive"}
        </Badge>
      )
    },
    enableColumnFilter: false,
  }),
  columnHelper.accessor('id', {
    id: 'roles',
    header: 'Roles',
    cell: (info) => {
      const { handleNavigation } = useNavigation();
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation(ROUTES.ADMIN.USERS.EDIT(info.row.original.email));
          }}
        >
          View
        </Button>
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
        label: "Add User",
        variant: "default",
        icon: PlusIcon,
        onClick: () => {
          handleNavigation(ROUTES.ADMIN.USERS.ADD)
        },
      }]
  }

}

export { columns, getToolbarConfig }
import { createColumnHelper } from "@tanstack/react-table"
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { ROUTES } from '@/config/routes';
import { PlusIcon, Users, Trash2 } from 'lucide-react';
import { User } from '@/types/admin/user';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getInitials } from '@/lib/utils';
import { useNavigation } from "@/hooks/useNavigation";

const columnHelper = createColumnHelper<User>()

interface ColumnsProps {
  onDelete?: (user: User) => void;
}

const createColumns = (props?: ColumnsProps): ColumnDefWithFilters<User>[] => [
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
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: (info) => {
      const user = info.row.original;
      
      // Check if user has admin role
      const hasAdminRole = user.bh_roles?.some(
        (role) => role.role_name === 'admin_role' || role.role_name === 'tenant_admin'
      ) ?? false;
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasAdminRole) {
                    props?.onDelete?.(user);
                  }
                }}
                disabled={hasAdminRole}
                className={`h-8 w-8 p-0 ${
                  hasAdminRole 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">
                  {hasAdminRole ? 'Cannot delete admin user' : `Delete ${user.username}`}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasAdminRole ? 'Cannot delete admin user' : 'Delete user'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableColumnFilter: false,
  })
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

const columns = createColumns();
export { columns, createColumns, getToolbarConfig }

import { createColumnHelper } from "@tanstack/react-table"
import type {TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { Environment } from '@/types/admin/environemnt';
import { ROUTES } from '@/config/routes';
import { useNavigation } from '@/hooks/useNavigation';
import { PlusIcon, Settings2 } from 'lucide-react';


const columnHelper = createColumnHelper<Environment>()


export const columns: ColumnDefWithFilters<Environment>[] = [
  columnHelper.accessor('bh_env_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('bh_env_provider_name', {
    header: 'Type',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    enableColumnFilter: false,
  }),
  
];

export const getToolbarConfig = (): TToolbarConfig => {
  const { handleNavigation } = useNavigation()
  return {
    buttons: [
      {
        label: <Settings2 className="mr-2 h-4 w-4" />,
        variant: "outline",
        icon: PlusIcon,
        onClick: () => {
          handleNavigation(ROUTES.ADMIN.ENVIRONMENT.ADD)
        },
      }]
  }

}

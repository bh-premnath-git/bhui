import { createColumnHelper } from "@tanstack/react-table"
import type {TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { Environment } from '@/types/admin/environment';
import { ROUTES } from '@/config/routes';
import { useNavigation } from '@/hooks/useNavigation';
import { PlusIcon, Settings2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/lib/date-format";

const columnHelper = createColumnHelper<Environment>()

const columns: ColumnDefWithFilters<Environment>[] = [
  columnHelper.accessor('bh_env_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('cloud_provider', {
    header: 'Type',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('created_at', {
    header: 'Created On',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string | null;
      return <div>{formatTimestamp(date)}</div>;
    },
    enableColumnFilter: false,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ row }) => {
      const type = row.getValue('status') as string;
      return (
        <Badge className={`capitalize ${type === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {type}
        </Badge>
      );
    },
    enableColumnFilter: false,
  }),
];

const getToolbarConfig = (): TToolbarConfig => {
  const { handleNavigation } = useNavigation()
  return {
    buttons: [
      {
        label: <Settings2 className="mr-2 h-4 w-4" />,
        variant: "outline",
        className: "bg-primary text-primary-foreground",
        icon: PlusIcon,
        onClick: () => {
          handleNavigation(ROUTES.ADMIN.ENVIRONMENT.ADD)
        },
      }]
  }

}

export { columns, getToolbarConfig }

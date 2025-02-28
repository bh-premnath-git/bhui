import { createColumnHelper } from "@tanstack/react-table";
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table";
import { Connection } from "@/types/admin/connection";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/routes";
import { useNavigation } from "@/hooks/useNavigation";
import { PlusIcon, Cable } from "lucide-react";

const columnHelper = createColumnHelper<Connection>();

const columns: ColumnDefWithFilters<Connection>[] = [
    columnHelper.accessor('connection_config_name',{
        header: 'Name',
        enableColumnFilter: true
    }),
    columnHelper.accessor('connection_name',{
        header:'Database',
        enableColumnFilter: true
    }),
    columnHelper.accessor('connection_type', {
        header: 'Type',
        enableColumnFilter: true,
    }),
    columnHelper.accessor('connection_status', {
        header: 'Status',
        cell: ({ row }) => {
        const type = row.getValue('status') as string;
        return (
            <Badge className={`capitalize ${type === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {type}
            </Badge>
        );
        },
        enableColumnFilter: true,
    })
];

const getToolbarConfig = (): TToolbarConfig => {
    const { handleNavigation } = useNavigation()
    return {
      buttons: [
        {
          label: <Cable className="mr-2 h-4 w-4" />,
          variant: "outline",
          icon: PlusIcon,
          onClick: () => {
            handleNavigation(ROUTES.ADMIN.CONNECTION.ADD)
          },
        }]
    }
  
  }
  
  export { columns, getToolbarConfig }
  
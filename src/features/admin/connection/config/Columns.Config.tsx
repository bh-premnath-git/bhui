import { createColumnHelper } from "@tanstack/react-table";
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table";
import { Connection } from "@/types/admin/connection";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/routes";
import { useNavigation } from "@/hooks/useNavigation";
import { PlusIcon, Cable, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatTimestamp } from "@/lib/date-format";
import { connectionImages } from "@/types/admin/environment";

const columnHelper = createColumnHelper<Connection>();

interface ColumnsProps {
  onDelete?: (connection: Connection) => void;
}

const createColumns = (props?: ColumnsProps): ColumnDefWithFilters<Connection>[] => [
    columnHelper.accessor('connection_config_name',{
        header: 'Name',
        enableColumnFilter: true,
        cell: ({ row }) => {
            const name = row.getValue('connection_config_name') as string;
            const connName = row.original.connection_name
            ?.toLowerCase()
            .replace(/\s+/g, "") || '';
            const icon = connectionImages[connName] || null;
             return (
                <div className="flex items-center">
                    {icon && <img src={icon} alt={connName} className="mr-2 h-4 w-4" />}
                    {name}
                </div>
            );
        },
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
        const type = row.getValue('connection_status') as string;
        return (
            <Badge className={`capitalize ${type === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {type}
            </Badge>
        );
        },
        enableColumnFilter: true,
    }),
    columnHelper.accessor('created_at', {
        header: 'Created On',
        enableColumnFilter: true,
        cell: ({ row }) => {
            const date = row.getValue('created_at') as string | null;
            return <div>{formatTimestamp(date)}</div>;
        },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const connection = info.row.original;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    props?.onDelete?.(connection);
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete {connection.connection_config_name}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete connection</p>
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
          label: <Cable className="mr-2 h-4 w-4" />,
          variant: "outline",
          className: "bg-primary text-primary-foreground",
          icon: PlusIcon,
          onClick: () => {
            handleNavigation(ROUTES.ADMIN.CONNECTION.ADD)
          },
        }]
    }
  
  }
  
  const columns = createColumns();
  export { columns, createColumns, getToolbarConfig }
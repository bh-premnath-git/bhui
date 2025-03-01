import { createColumnHelper } from "@tanstack/react-table";
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table";
import { Connection } from "@/types/admin/connection";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/routes";
import { useNavigation } from "@/hooks/useNavigation";
import { PlusIcon, Cable, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
        const type = row.getValue('connection_status') as string;
        return (
            <Badge className={`capitalize ${type === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {type}
            </Badge>
        );
        },
        enableColumnFilter: true,
    }),
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right">
              <DropdownMenuItem
               onClick={(event) => {
                event.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent("openConnectionDeleteDialog", {
                    detail: row.original,
                  })
                );
              }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableColumnFilter: false,
    }
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
  
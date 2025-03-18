import { createColumnHelper } from "@tanstack/react-table";
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table";
import { Connection } from "@/types/admin/connection";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/routes";
import { useNavigation } from "@/hooks/useNavigation";
import { PlusIcon, Cable, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConnectionForm } from "../components/ConnectionForm";

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
        const [showEditDialog, setShowEditDialog] = useState(false);
        const connection = row.original;

        return (
          <>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowEditDialog(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={(event) => {
                  event.stopPropagation();
                  window.dispatchEvent(
                    new CustomEvent("openConnectionDeleteDialog", {
                      detail: row.original,
                    })
                  );
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-4xl">
                <ConnectionForm
                  connectionType={connection.connection_type}
                  connectionDisplayName={connection.connection_name}
                  connectionName={connection.connection_name}
                  connectionId={connection.connection_id.toString()}
                  connectionConfigName={connection.connection_config_name}
                  onBack={() => setShowEditDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </>
        );
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
  
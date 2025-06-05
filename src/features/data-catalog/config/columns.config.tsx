import { createColumnHelper } from '@tanstack/react-table';
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { formatDate } from "@/lib/date-format";
import {
  Database,
  PlusIcon,
  ImportIcon
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const columnHelper = createColumnHelper<DataSource>();

const columns: ColumnDefWithFilters<DataSource>[] = [
  columnHelper.accessor('data_src_name', {
    header: 'Name',
    cell: (info) => {
      const value = info.getValue();
      const rowData = info.row.original;
      return (
        <div className="flex items-center gap-4 min-w-[250px]">
          <div className="flex items-center justify-center bg-muted rounded-md p-2">
            <Database className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground mb-1">
              {value || "Never"}
            </p>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {rowData.data_src_desc || "No description available"}
            </p>
          </div>
        </div>
      );
    },
    enableColumnFilter: true,
  }),
  columnHelper.accessor('bh_project_name', {
    header: 'Project',
    enableColumnFilter: true,
  }),

 
  columnHelper.accessor('updated_at', {
    header: 'Last Updated',
    cell: (info) => formatDate(info.getValue()),
    enableColumnFilter: false,
  }),
];

const getToolbarConfig = (): TToolbarConfig => {
  return {
    buttons: [
      {
        label: "Dataset",
        variant: "outline",
        className: "bg-primary text-primary-foreground",
        icon: PlusIcon,
        dropdownItems: [
          {
            label: "Tables",
            icon: Database,
            onClick: () => {
              window.dispatchEvent(new Event("openImportSourceDialog"));
            },
          },
          {
            label: "Flat File",
            icon: ImportIcon,
            onClick: () => {
              window.dispatchEvent(new Event("openLocalImport"));
            },
          }
        ]
      },
    ]
  }
}

export { columns, getToolbarConfig }

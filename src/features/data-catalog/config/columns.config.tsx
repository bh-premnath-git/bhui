import { createColumnHelper } from '@tanstack/react-table';
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { formatDate } from "@/lib/date-format";
import {
  Database,
  PlusIcon,
  ImportIcon,
  Trash2
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const columnHelper = createColumnHelper<DataSource>();

interface ColumnsProps {
  onDelete?: (datasource: DataSource) => void;
}

const createColumns = (props?: ColumnsProps): ColumnDefWithFilters<DataSource>[] => [
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
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: (info) => {
      const datasource = info.row.original;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  props?.onDelete?.(datasource);
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete {datasource.data_src_name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete data source</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
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

// Keep the original columns export for backward compatibility
const columns: ColumnDefWithFilters<DataSource>[] = createColumns();

export { columns, createColumns, getToolbarConfig }

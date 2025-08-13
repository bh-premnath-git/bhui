import { createColumnHelper } from '@tanstack/react-table';
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { formatDate } from "@/lib/date-format";
import { format } from 'date-fns';
import {
  Database,
  PlusIcon,
  ImportIcon,
  Trash2,
  Info
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { connectionImages } from "@/types/admin/environment";

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
      const connName = rowData.connection_config?.connection_name
        ?.toLowerCase()
        .replace(/\s+/g, "") || '';


      return (
        <div className="flex items-center gap-4 min-w-[250px]">
          <div className="flex items-center justify-center bg-muted rounded-md p-2 w-10 h-10">
            {connectionImages[connName] ? (
              <img
                src={connectionImages[connName]}
                alt={rowData.connection_config?.connection_name || 'connection'}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Database className="w-6 h-6 text-green-500" />
            )}
          </div>
          <div>
            <span className="text-base font-medium text-foreground">
              {value || "Never"}
            </span>
          </div>
        </div>
      );
    }
    ,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('data_src_desc', {
    header: 'Description',
    cell: (info) => {
      const description = info.getValue();
      if (!description) return <span className="text-muted-foreground">No description</span>;
      
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm text-foreground">
            {description.length > 50 
              ? `${description.substring(0, 50)}...` 
              : description}
          </span>
          {description.length > 100 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="whitespace-pre-wrap">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
    enableColumnFilter: true,
  }),
  columnHelper.accessor('bh_project_name', {
    header: 'Project',
    enableColumnFilter: true,
  }),
  columnHelper.accessor((row) => row.connection_config?.connection_config_name ?? "-", {
    id: 'connection_name',
    header: 'Connection',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('updated_at', {
    header: 'Last Updated',
    cell: (info) => {
      const dateValue = info.getValue();
      if (!dateValue) return "Never";
      
      try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "Invalid date";
        
        const shortFormat = format(date, 'MMM d'); // e.g., "Aug 12"
        const fullFormat = format(date, 'dd MMM yyyy, h:mm a'); // e.g., "12 Aug 2025, 9:21 AM"
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">{shortFormat}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{fullFormat}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } catch (error) {
        return "Invalid date";
      }
    },
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

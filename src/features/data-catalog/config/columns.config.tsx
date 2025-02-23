import { createColumnHelper } from '@tanstack/react-table';
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { formatDate } from "@/lib/date-format";
import {
  Database,
  Clock,
  PlusIcon
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const columnHelper = createColumnHelper<DataSource>();

const columns: ColumnDefWithFilters<DataSource, any>[] = [
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
  columnHelper.accessor('total_records', {
    header: 'Total Records',
    enableColumnFilter: false,
  }),
  columnHelper.accessor('data_src_quality', {
    header: 'Quality',
    cell: (info) => {
      const value = info.getValue();
      const qualityScore = parseInt(value, 10);
      const getColor = (score: number) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 50) return "bg-yellow-500";
        return "bg-red-500";
      };

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-[120px]">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    {qualityScore}%
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full">
                  <div
                    className={`h-full rounded-full ${getColor(qualityScore)}`}
                    style={{ width: `${qualityScore}%` }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Quality Score: {qualityScore}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableColumnFilter: false,
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
        label: "Data Source",
        variant: "outline",
        icon: PlusIcon,
        onClick: () => {
          window.dispatchEvent(new Event("openImportSourceDialog"));
        },
      },
      {
        label: "Xplore",
        variant: "outline",
        icon: Clock,
        onClick: () => {
          window.dispatchEvent(new Event("openXploreDialog"));
        },
      }
    ]
  }
}

export { columns, getToolbarConfig }

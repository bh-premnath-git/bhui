import { createColumnHelper } from "@tanstack/react-table"
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { PlusIcon, Network, MoreVertical  } from 'lucide-react';
import { Pipeline } from '@/types/designer/pipeline';
import { formatDate } from "@/lib/date-format";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const columnHelper = createColumnHelper<Pipeline>()

const columns: ColumnDefWithFilters<Pipeline, any>[] = [
  columnHelper.accessor('pipeline_name', {
    header: 'Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('bh_project_name', {
    header: 'Project Name',
    enableColumnFilter: true,
  }),
  columnHelper.accessor('updated_at', {
    header: 'Last Updated',
    cell: ({ row }) => formatDate(row.getValue('updated_at') ?? new Date()),
    enableColumnFilter: false,
  }),
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-5 w-5 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="h-4 w-4" align="end" side="right">
            <DropdownMenuItem>
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
  return {
    buttons: [
      {
        label: <Network className="mr-2 h-4 w-4" />,
        variant: "outline",
        icon: PlusIcon,
        onClick: () => {
          console.log("L");
        },
      }]
  }
}

export { columns, getToolbarConfig }

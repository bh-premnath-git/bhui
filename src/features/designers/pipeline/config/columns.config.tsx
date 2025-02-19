import { createColumnHelper } from "@tanstack/react-table"
import type { TToolbarConfig, ColumnDefWithFilters } from "@/types/table"
import { PlusIcon, Network } from 'lucide-react';
import { Pipeline } from '@/types/designer/pipeline';

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
  //  last updated, last executed
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

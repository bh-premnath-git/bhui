import React, {useState} from 'react';
import { PlusIcon } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Pipeline } from '@/types/designer.types';
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { getUniqueValues } from '@/lib/utils';
import { CustomToolbarConfig } from "@/types/data-table.types";
import PipeLineCreatePopup from './pipeLineCreatePopup/pipeLineCreatePopup';

interface PipelineTableProps {
  pipelines?: Pipeline[];
}

export const PipelineTable = ({ pipelines = [] }: PipelineTableProps) => {
  const tableName: string = "pipelines"

  const handleDelete = (event: React.MouseEvent, data: Pipeline) => {
    event.stopPropagation()
    console.log("Deleting environment with ID:", data); 
  }

  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false)
  const navigate = useNavigate()
  const handleAddPipeline = () => {
    setIsCreatePopupOpen(true);
  };
  const columns: ColumnDefWithFilters<Pipeline>[] = [
    {
      accessorKey: 'pipeline_name',
      header: 'Name',
      filterOptions: getUniqueValues(pipelines, 'pipeline_name')
    },
    {
      accessorKey: 'bh_project_name',
      header: 'Bh Project Name',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.original.status === 'active'
          ? 'bg-green-100 text-green-800'
          : row.original.status === 'draft'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'lastModified',
      header: 'Last Modified',
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-red-600"
                onClick={(event) => handleDelete(event, row.original)}
              >Delete Pipeline</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }
  ];

  const customToolbarConfig: CustomToolbarConfig = {
    buttons: [
      {
        label: "Add Pipeline",
        icon: PlusIcon,
        variant: "default",
        onClick: () => { handleAddPipeline() },
      },
    ],
  };

  const rowClickHandler = (row: Row<Pipeline>) => {
    navigate(`/designers/build-playground/${row.original.pipeline_id}`);
  }

  return <>
  <PipeLineCreatePopup
      showToast={toast}
      open={isCreatePopupOpen} handleClose={() => setIsCreatePopupOpen(false)} />
    {<DataTable
      tableName={tableName}
      customToolbarConfig={customToolbarConfig}
      onRowClick={rowClickHandler}
      columns={columns} data={pipelines} showToolbar={true} />}
  </>;
};
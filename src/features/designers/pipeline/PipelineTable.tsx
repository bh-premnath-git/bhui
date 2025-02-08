import { useState } from 'react';
import { Pipeline } from '@/types/designer.types';
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { getUniqueValues } from '@/lib/utils';
import { CustomToolbarConfig } from "@/types/data-table.types";
import { PlusIcon } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import PipeLineCreatePopup from './pipeLineCreatePopup/pipeLineCreatePopup';
import { toast } from 'sonner';

interface PipelineTableProps {
  pipelines?: Pipeline[];
}

export const PipelineTable = ({ pipelines = [] }: PipelineTableProps) => {
  const tableName: string = "pipelines"
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
    {!isCreatePopupOpen && <DataTable
      tableName={tableName}
      customToolbarConfig={customToolbarConfig}
      onRowClick={rowClickHandler}
      columns={columns} data={pipelines} showToolbar={true} />}
    <PipeLineCreatePopup
      showToast={toast}
      open={isCreatePopupOpen} handleClose={() => setIsCreatePopupOpen(false)} />

  </>;
};
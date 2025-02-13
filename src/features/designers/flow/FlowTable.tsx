import React, { useState } from 'react';
import { PlusIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Flow } from "@/types/features/flow/types";
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { getUniqueValues } from '@/lib/utils';
import { CustomToolbarConfig } from "@/types/data-table.types";
import { formatDate } from '@/lib/dayeformat';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FlowCreatePopup from './flowdesigner/flow-create-popup';
import { useAppDispatch } from '@/hooks/useRedux';
import { setFlow } from '@/store/features/flowSlice';

interface FlowTableProps {
  flows: Flow[];
}

export const FlowTable = ({ flows }: FlowTableProps) => {
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const tableName: string = "flows"

  const handleAddFlow = () => {
    setIsCreatePopupOpen(true);
  };

  const handleDelete = (event: React.MouseEvent, data: Flow) => {
    event.stopPropagation()
    console.log("Deleting environment with ID:", data);
  };

  const columns: ColumnDefWithFilters<Flow>[] = [
    {
      accessorKey: "flow_name",
      header: "Name",
      filterOptions: getUniqueValues(flows, 'flow_name')
    },
    {
      accessorKey: "bh_project_name",
      header: "Project",
    },
    {
      accessorKey: "user",
      header: "Created By"
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      cell: ({ row }) => (
        <span>{formatDate(row.original.updated_at)}</span>
      )
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
              >Delete Flow</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }
  ];

  const customToolbarConfig: CustomToolbarConfig = {
    buttons: [
      {
        label: "Add Flow",
        icon: PlusIcon,
        variant: "default",
        onClick: () => { handleAddFlow() },
      },
    ],
  };

  const rowClickHandler = (row: Row<Flow>) => {
    dispatch(setFlow(row.original))
    navigate(`/designers/flow-playground/${row.original.flow_id}`);
  }

  return <>
    <FlowCreatePopup open={isCreatePopupOpen} showToast={toast} handleClose={() => setIsCreatePopupOpen(false)} />
    <DataTable
      tableName={tableName}
      customToolbarConfig={customToolbarConfig}
      onRowClick={rowClickHandler}
      columns={columns} data={flows} showToolbar={true} /></>;
};
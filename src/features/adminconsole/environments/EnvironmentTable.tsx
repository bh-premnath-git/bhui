import _ from 'lodash';
import { Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { Environment } from '@/types/features/environment/types';
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { CustomToolbarConfig } from "@/types/data-table.types";
import { getUniqueValues } from "@/lib/utils";
import { formatDate } from '@/lib/dayeformat';
import { useAppDispatch } from '@/hooks/useRedux';
import { setEditEnvironmentData } from '@/store/oldstore/EnvironmentSlice';

interface EnvironmentTableProps {
  environments: Environment[]
}

export const EnvironmentTable = ({ environments }: EnvironmentTableProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const tableName: string = "environments"
  
  const columns: ColumnDefWithFilters<Environment>[] = [
    {
      accessorKey: "bh_env_name",
      header: "Name",
      filterOptions: getUniqueValues(environments, 'bh_env_name')
    },
    {
      accessorKey: "cloud_provider_name",
      header: "Cloud Provider",
      filterOptions: getUniqueValues(environments, 'cloud_provider_name')
    },
    {
      accessorKey: "bh_env_provider_name",
      header: "Type",
      filterOptions: getUniqueValues(environments, 'bh_env_provider_name')
    },
    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ row }) => (
        <span>{formatDate(row.original.created_on)}</span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.original.status === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {_.startCase(row.original.status as string)}
        </span>
      )
    },
  ]
  const customToolbarConfig: CustomToolbarConfig = {
    buttons: [
      {
        label: "Add Environment",
        icon: PlusIcon,
        variant: "default",
        onClick: () => {
          navigate("/admin-console/environment/add")
        },
      },
    ],
  };

  const rowClickHandler = (row: Row<Environment>) => {
    dispatch(setEditEnvironmentData(row.original));
    navigate(`/admin-console/environment/${row.original.bh_env_id}`);
  }

  return <DataTable
    tableName={tableName}
    customToolbarConfig={customToolbarConfig}
    columns={columns} data={environments} showToolbar={true}
    onRowClick={rowClickHandler}
  />;
};
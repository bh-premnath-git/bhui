import { Release } from '@/types/dataops.types';
import { DataTable } from "@/components/bh-table/data-table"
import { ColumnDefWithFilters } from "@/types/typesys.types";
import { getUniqueValues } from "@/lib/utils";



interface ReleasesTableProps {
  releases: Release[];
}

export const ReleasesTable = ({ releases }: ReleasesTableProps) => {
  const columns: ColumnDefWithFilters<Release>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      filterOptions: getUniqueValues(releases, 'name')
    },
    {
      accessorKey: 'environment',
      header: 'Environment',
      filterOptions: getUniqueValues(releases, 'environment')
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.status === 'deployed'
            ? 'bg-green-100 text-green-800'
            : row.original.status === 'failed'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'created_by',
      header: 'created by',
    },
    {
      accessorKey: 'last_updated',
      header: 'Last Updated',
    },
    {
      accessorKey: 'deployed_on',
      header: 'Deployed On',
    }
  ];
  return <DataTable columns={columns} data={releases} showToolbar={true} />;
};
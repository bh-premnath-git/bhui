import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './config/columns.config';
import { ComputeCluster } from '@/types/admin/compute-cluster';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';

interface ComputeClusterListProps {
  clusters: ComputeCluster[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function ComputeClusterList({ clusters, pageCount, pageIndex, pageSize, onPageChange, onPageSizeChange, hasNextPage, hasPreviousPage }: ComputeClusterListProps) {
  const { handleNavigation } = useNavigation();

  const onRowClickHandler = (row: Row<ComputeCluster>) => {
    handleNavigation(ROUTES.ADMIN.COMPUTE_CLUSTER.EDIT(row.original.id.toString()));
  };

  return (
    <DataTable<ComputeCluster>
      columns={columns}
      data={clusters || []}
      topVariant='simple'
      onRowClick={onRowClickHandler}
      toolbarConfig={getToolbarConfig()}
      pageCount={pageCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
    />
  );
}
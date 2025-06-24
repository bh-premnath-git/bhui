import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './config/columns.config';
import { ComputeCluster } from '@/types/admin/compute-cluster';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';

export function ComputeClusterList({ clusters }: { clusters: ComputeCluster[] }) {
  const { handleNavigation } = useNavigation();

  const onRowClickHandler = (row: Row<ComputeCluster>) => {
    handleNavigation(ROUTES.ADMIN.COMPUTE_CLUSTER.EDIT(row.original.id.toString()));
  };

  return (
    <DataTable<ComputeCluster>
      columns={columns}
      data={clusters || []}
      topVariant='simple'
      pagination={true}
      onRowClick={onRowClickHandler}
      toolbarConfig={getToolbarConfig()}
    />
  );
}
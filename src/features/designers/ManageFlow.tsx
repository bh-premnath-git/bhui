import { DataTable } from '@/components/bh-table/data-table';
import { columns, getToolbarConfig } from './flow/config/columns.config';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { Flow } from '@/types/designer/flow';
import { useFlowManagementService } from './flow/services/flowMgtSrv';

export function FlowList({ flows }: { flows: Flow[] }) {
  const { handleNavigation } = useNavigation();
  const flowSrv = useFlowManagementService();

  const onRowClickHandler = (row: Row<Flow>) => {
    flowSrv.selectedFlow(row.original)
    handleNavigation(ROUTES.DESIGNERS.FLOW_PLAYGROUND(row.original.flow_id.toString()))
  }

  return (
    <DataTable<Flow>
      columns={columns}
      data={flows || []}
      topVariant="simple"
      pagination={true}
      toolbarConfig={getToolbarConfig()}
      onRowClick={onRowClickHandler}
    />
  );
}

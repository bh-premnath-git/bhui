import { DataTable } from '@/components/bh-table/data-table';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { columns } from './flow/config/columns.config';
import { Flow } from '@/types/designer/flow';
import { useFlowManagementService } from './flow/services/flowMgtSrv';

export function FlowList({ flows }: { flows: Flow[] }) {
  const { handleNavigation } = useNavigation();
  const flowSrv = useFlowManagementService();

  return (
    <DataTable<Flow>
      columns={columns}
      data={flows || []}
      topVariant="simple"
      pagination={true}
    />
  );
}

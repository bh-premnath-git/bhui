import { DataTable } from '@/components/bh-table/data-table';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { columns, getToolbarConfig } from './pipeline/config/columns.config';
import { Pipeline } from '@/types/designer/pipeline';
import { usePipelineManagementService } from './pipeline/services/pipelineMgtSrv';

export function PipelineList({ pipeline }: { pipeline: Pipeline[] }) {
  const { handleNavigation } = useNavigation();
  const pipelineSrv = usePipelineManagementService();

  const onRowClickHandler = (row: Row<Pipeline>) => {
    pipelineSrv.selectedPipeline(row.original)
    handleNavigation(ROUTES.DESIGNERS.BUILD_PLAYGROUND(row.original.pipeline_id.toString()))
  }

  return (
    <DataTable<Pipeline>
      columns={columns}
      data={pipeline || []}
      topVariant="simple"
      pagination={true}
      toolbarConfig={getToolbarConfig()}
      onRowClick={onRowClickHandler}
    />
  );
}

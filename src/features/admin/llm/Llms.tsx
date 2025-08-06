import { useCallback } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { LLM } from '@/types/admin/llm';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { useLlmManagementServive } from './services/llmMgtSrv';
import { getLLMToolbarConfig, llmColumns } from './config/columns.config';

interface LLMListProps {
  llms: LLM[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function LlmsList({
  llms,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPreviousPage
}: LLMListProps) {
  const { handleNavigation } = useNavigation();
  const llmMgtSrv = useLlmManagementServive();

  const onRowClickHandler = useCallback((row: Row<LLM>) => {
    llmMgtSrv.setSelectedLlm(row.original)
    handleNavigation(ROUTES.ADMIN.LLM.EDIT(row.original.llm_id.toString()));
  }, [llmMgtSrv, handleNavigation]);


  return (
    <DataTable<LLM>
      columns={llmColumns}
      data={llms || []}
      topVariant="simple"
      onRowClick={onRowClickHandler}
      toolbarConfig={getLLMToolbarConfig()}
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

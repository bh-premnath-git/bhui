import { useCallback } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { columns } from './config/Columns.Config';
import { Prompt } from '@/types/admin/prompt';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { getToolbarConfig } from './config/Columns.Config';

interface ListPromptProps {
  prompts: Prompt[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export function ListPrompt({ prompts, pageCount, pageIndex, pageSize, onPageChange, onPageSizeChange, hasNextPage, hasPreviousPage }: ListPromptProps) {
  const { handleNavigation } = useNavigation();
  
  const onRowClickHandler = useCallback((row: Row<Prompt>) => {
    if(row.original.id) {
      handleNavigation(ROUTES.ADMIN.PROMPT.EDIT(row.original.id.toString()));
    }
  }, [handleNavigation]);

  return (
    <DataTable<Prompt>
      columns={columns}
      data={prompts || []}
      topVariant="simple"
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
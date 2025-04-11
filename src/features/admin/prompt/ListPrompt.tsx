import { useCallback, useState } from 'react';
import { DataTable } from '@/components/bh-table/data-table';
import { columns } from './config/Columns.Config';
import { Prompt } from '@/types/admin/prompt';
import { Row } from '@tanstack/react-table';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { getToolbarConfig } from './config/Columns.Config';

export function ListPrompt({ prompts }: { prompts: Prompt[] }) {
  const { handleNavigation } = useNavigation();
  
  // Add pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Calculate total count and current page data
  const totalCount = prompts?.length || 0;
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const currentPageData = prompts.slice(startIndex, endIndex);

  const onRowClickHandler = useCallback((row: Row<Prompt>) => {
    handleNavigation(ROUTES.ADMIN.PROMPT.EDIT(row.original.id.toString()));
  }, [handleNavigation]);

  // Add pagination handlers
  const handlePageChange = (page: number) => {
    setPageIndex(page - 1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page when changing page size
  };

  return (
    <DataTable<Prompt>
      columns={columns}
      data={currentPageData}
      topVariant="simple"
      pagination={true}
      pageIndex={pageIndex}
      pageSize={pageSize}
      pageCount={Math.ceil(totalCount / pageSize)}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onRowClick={onRowClickHandler}
      toolbarConfig={getToolbarConfig()}
    />
  );
}
import { useEffect, useState } from 'react';
import { FolderGit2 } from 'lucide-react';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { useLlms } from '@/features/admin/llm/hooks/useLlms';
import { useLlmManagementService } from '@/features/admin/llm/services/llmMgtSrv';
import { LlmsList } from '@/features/admin/llm/Llms';

function LlmsListPage() {
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { llms, total, isFetching, isLoading, isError, next, prev } = useLlms({
    shouldFetch: true,
    limit: pageSize,
    offset: offset,
  });
  const llmMgntSrv = useLlmManagementService();
  const { handleNavigation } = useNavigation();

  const pageIndex = Math.floor(offset / pageSize);

  const handlePageChange = (page: number) => {
    const currentPageIndex = pageIndex;
    if (page > currentPageIndex && next) {
        setOffset(o => o + pageSize);
    } else if (page < currentPageIndex && prev) {
        setOffset(o => Math.max(0, o - pageSize));
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
      setPageSize(newPageSize);
      setOffset(0);
  };

  useEffect(() => {
    if (Array.isArray(llms) && llms.length > 0) {
      llmMgntSrv.setLlms(llms);
    }
  }, [llms, llmMgntSrv]);

  if (isLoading) {
    return (
      <div className="p-6">
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Error Loading LLMs"
          description="There was an error loading the Llms . Please try again later."
        />
      </div>
    );
  }

  if (!Array.isArray(llms) || llms.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          Icon={FolderGit2}
          title="No LLM Found"
          description="You haven't created any LLMs yet. Click the button below to create one."
          action={
            <Button 
              onClick={() => handleNavigation(ROUTES.ADMIN.LLM.ADD)}
              className="mt-4"
            >
              Create LLM
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingState classNameContainer="w-40 h-40" />
          </div>
        )}
        <LlmsList
          llms={llms}
          pageCount={Math.ceil((total || 0) / pageSize)}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          hasNextPage={next}
          hasPreviousPage={prev}
        />
      </div>
    </div>
  );
}

export default withPageErrorBoundary(LlmsListPage, 'Llms');

import { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { LazyLoading } from '@/components/shared/LazyLoading';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useEnvironments } from '@/features/admin/environment/hooks/useEnvironments';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EnvironmentList } from '@/features/admin/environment/Environment';
import { useEnvironmentManagementServive } from '@/features/admin/environment/services/envMgtSrv';
import { Environment } from '@/types/admin/environment';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';

function Environments() {
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { environments, total, isFetching, isLoading, isError, next, prev } = useEnvironments({
    shouldFetch: true,
    limit: pageSize,
    offset: offset,
  });
  const envMgntSrv = useEnvironmentManagementServive();
  const { handleNavigation } = useNavigation();
  
  // Filter out MWAA environments and ensure we only have Environment objects
  const regularEnvironments = environments?.filter((env): env is Environment => 
    'bh_env_id' in env && 'bh_env_name' in env
  ) || [];

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
    if(regularEnvironments.length > 0){
      envMgntSrv.setEnvironments(regularEnvironments);
    }
  }, [regularEnvironments]);

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
        <ErrorState message="Something went wrong" />
      </div>
    );
  }

  if (regularEnvironments.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No Environments Found"
          description="Get started by creating a new environment to manage your deployments."
          Icon={Settings2}
          action={
            <Button 
              onClick={() => handleNavigation(ROUTES.ADMIN.ENVIRONMENT.ADD)}
              className="mt-4"
            >
              Create Environment
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
            <LazyLoading fullScreen={false} className='w-40 h-40' />
          </div>
        )}
        <EnvironmentList 
          environments={regularEnvironments}
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

export default withPageErrorBoundary(Environments, 'Environments');

import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Button } from '@/components/ui/button';
import { useConnections } from '@/features/admin/connection/hooks/useConnection';
import { ListConnection } from '@/features/admin/connection/ListConnection';
import { useConnectionManagementService } from '@/features/admin/connection/services/connMgtSrv';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { Cable } from 'lucide-react';
import { useEffect, useState } from 'react';

function ConnectionList() {
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { connections, total, isFetching, isLoading, isError, next, prev } = useConnections({
    shouldFetch: true,
    limit: pageSize,
    offset: offset,
  });
  const connMgtSrv = useConnectionManagementService();
  const { handleNavigation } = useNavigation()

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
    if (Array.isArray(connections) && connections.length > 0) {
      connMgtSrv.setConnection(connections);
    }
  }, [connections, connMgtSrv]);

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
          title="Error Loading Projects"
          description="There was an error loading the projects. Please try again later."
        />
      </div>
    );
  }

  if (!Array.isArray(connections) || connections.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          Icon={Cable}
          title="No Connection Found"
          description="Get started by creating a new connection."
          action={
            <Button 
              onClick={() => handleNavigation(ROUTES.ADMIN.CONNECTION.ADD)}
              className="mt-4"
            >
              Create Connection
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
        <ListConnection 
          connections={connections}
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

export default withPageErrorBoundary(ConnectionList, 'ConnectionList');

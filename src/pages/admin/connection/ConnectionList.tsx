import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { useConnections } from '@/features/admin/connection/hooks/useConnection';
import { ListConnection } from '@/features/admin/connection/ListConnection';
import { useConnectionManagementService } from '@/features/admin/connection/services/connMgtSrv';
import { Cable } from 'lucide-react';
import { useEffect } from 'react';

function ConnectionList() {
  const { connections, isLoading, isError, isFetching } = useConnections();
  const connMgtSrv = useConnectionManagementService();

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
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingState className="w-40 h-40" />
          </div>
        )}
        <ListConnection connections={connections} />
      </div>
    </div>
  );
}

export default withPageErrorBoundary(ConnectionList, 'ConnectionList');

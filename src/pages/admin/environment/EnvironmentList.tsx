import { useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useEnvironments } from '@/features/admin/environment/hooks/useEnvironments';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EnvironmentList } from '@/features/admin/environment/Environment';
import { useEnvironmentManagementServive } from '@/features/admin/environment/services/envMgtSrv'; 

function Environments() {
  const { environments, isLoading, isFetching, isError } = useEnvironments();
  const envMgntSrv = useEnvironmentManagementServive();
  useEffect(() => {
    if(environments && environments.length > 0){
      envMgntSrv.setEnvironments(environments);
    }
  }, []);

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

  if (environments?.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Welcome to Your User Management!"
          description="Ready to manage your users."
          Icon={Settings2}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingState className='w-40 h-40' />
          </div>
        )}
        <EnvironmentList environments={environments || []} />
      </div>
    </div>
  );
}

export default withPageErrorBoundary(Environments, 'Environments');

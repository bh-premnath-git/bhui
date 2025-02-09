import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { OperationsTable } from '@/features/dataops/operations/OperationsTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from "@/components/shared/EmptyState"
import { setOperations } from '@/store/features/operationSlice';
import { getDataSources } from '@/api/get-methods';
import { Package } from "lucide-react"

const OpsHub = () => {
  const dispatch = useAppDispatch();
  const { data: operations = [], isLoading, error } = getDataSources.operations();
  useEffect(() => {
    if (operations) {
      dispatch(setOperations(operations));

    }
  }, [dispatch, operations])

  if (isLoading) {
    return <LoadingState className='w-full min-h-screen' />;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />;
  }

  if (operations.length === 0) {
    return (
      <div className="container">
          <EmptyState
            title="Welcome to Your Job Monitor !"
            description="Ready to monitor your job when flow is started."
            Icon={Package}
          />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="bg-card rounded-lg shadow-sm">
        <OperationsTable operations={operations || []} />
      </div>
    </div>
  );
};

export default OpsHub;

import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { OperationsTable } from '@/features/dataops/operations/OperationsTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { setOperations } from '@/store/features/operationSlice';
import { getDataSources } from '@/api/get-methods';


const OpsHub = () => {
  const dispatch = useAppDispatch();
  const { data: operations = [], isLoading, error } = getDataSources.operations();
  useEffect(() => {
    if (operations) {
      dispatch(setOperations(operations));

    }
  }, [dispatch, operations])

  if (isLoading) {
    return <LoadingState className='w-full min-h-screen'/>;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />;
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

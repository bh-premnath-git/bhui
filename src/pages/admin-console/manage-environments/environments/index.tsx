import { useEffect } from 'react';
import { EnvironmentTable } from '@/features/adminconsole/environments/EnvironmentTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAppDispatch } from '@/hooks/useRedux';
import { getDataSources } from "@/api/get-methods";
import { setEnvironments } from '@/store/features/environmentslice';

const ManageEnvironments = () => {
  const dispatch = useAppDispatch();
  const { data: environments = [], isLoading, error } = getDataSources.manageEnvironments();

  useEffect(() => {
    if (environments) {
      dispatch(setEnvironments(environments));
    }
  }, [environments, dispatch]);

  if (isLoading) {
    return <LoadingState className='w-full min-h-screen'/>;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />;
  }

  return (
    <div className="container">
      <div className="bg-card rounded-lg shadow-sm">
        <EnvironmentTable environments={environments || []} />
      </div>
    </div>
  );
};

export default ManageEnvironments;
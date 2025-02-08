import { AlertsTable } from '@/features/dataops/alerts/AlertsTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { getDataSources } from '@/api/get-methods';

const AlertsHub = () => {
  const { data: alerts = [], isLoading, error } = getDataSources.alerts();

  if (isLoading) {
    return <LoadingState className='w-full min-h-screen'/>;
  }

  if (error) {
    return <ErrorState message={error instanceof Error ? error.message : String(error)} />;
  }

  return (
    <div className="container mx-auto">
      <div className="bg-card rounded-lg shadow-sm">
        <AlertsTable alerts={alerts || []} />
      </div>
    </div>
  );
};

export default AlertsHub;
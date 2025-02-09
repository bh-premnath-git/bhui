import { AlertsTable } from '@/features/dataops/alerts/AlertsTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { getDataSources } from '@/api/get-methods';
import { AlertCircle } from 'lucide-react';


const AlertsHub = () => {
  const { data: alerts = [], isLoading, error } = getDataSources.alerts();
  console.log("alerts >>>", alerts);

  if (isLoading) {
    return <LoadingState className='w-full min-h-screen' />;
  }

  if (error) {
    return <ErrorState message={error instanceof Error ? error.message : String(error)} />;
  }

  if (alerts.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="Welcome to Your Alert Monitor !"
          description="Ready to monitor your alert for the flow when the job is started."
          Icon={AlertCircle}
        />
      </div>)
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
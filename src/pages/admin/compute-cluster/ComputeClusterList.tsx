import { ComputeClusterList } from '@/features/admin/compute-cluster/ComputeCluster';
import { useComputeCluster } from '@/features/admin/compute-cluster/hooks/useComputeCluster';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';

export default function ComputeClusterListPage() {
  const { useComputeClusterList } = useComputeCluster();
  const { data: clusters, isLoading, isError, error, refetch } = useComputeClusterList();
  const { handleNavigation } = useNavigation();


  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading compute configs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Failed to load compute configs: {error?.message || 'Unknown error'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative">
        {clusters && clusters.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Compute Configs Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No compute configs have been configured yet.
              </p>
              <Button
                variant="default"
                onClick={() => {
                  // TODO: Navigate to create config page or open create config modal
                  console.log('Create config clicked');
                  handleNavigation(ROUTES.ADMIN.COMPUTE_CLUSTER.ADD);
                }}
                className="mr-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Config
              </Button>
            </div>
          </div>
        ) : (
          <ComputeClusterList clusters={clusters || []} />
        )}
      </div>
    </div>
  );
}
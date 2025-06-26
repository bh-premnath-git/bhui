import { ComputeClusterList } from '@/features/admin/compute-cluster/ComputeCluster';
import { useComputeCluster } from '@/features/admin/compute-cluster/hooks/useComputeCluster';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ComputeClusterListPage() {
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { useComputeClusterList } = useComputeCluster();
  const { data: paginatedResponse, isLoading, isError, error, refetch } = useComputeClusterList({ limit: pageSize, offset });

  const clusters = paginatedResponse?.data || [];
  const total = paginatedResponse?.total || 0;
  const next = paginatedResponse?.next || false;
  const prev = paginatedResponse?.prev || false;

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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading compute clusters...</p>
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
              Failed to load compute clusters: {error?.message || 'Unknown error'}
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
              <h3 className="text-lg font-semibold mb-2">No Compute Clusters Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No compute clusters have been configured yet.
              </p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <ComputeClusterList 
            clusters={clusters || []} 
            pageCount={Math.ceil(total / pageSize)}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            hasNextPage={next}
            hasPreviousPage={prev}
          />
        )}
      </div>
    </div>
  );
}
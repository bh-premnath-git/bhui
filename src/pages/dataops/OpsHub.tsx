import { useState } from 'react';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { LoadingState } from '@/components/shared/LoadingState';
import { OpsHub } from '@/features/dataops/OpsHub';
import { useDataOpsHub } from '@/features/dataops/dataOpsHubs/hooks/usedataOpsHub';

function OpsHubPage() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const offset = pageIndex * pageSize;
    const { jobs, total, isFetching, next, prev } = useDataOpsHub({ 
        shouldFetch: true,
        limit: pageSize, 
        offset 
    });
    
    const handlePageChange = (page: number) => {
        setPageIndex(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
    };
    
    return (
        <div className="p-6 h-full">
            <div className="relative h-full">
                {isFetching && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <LoadingState fullScreen={false} />
                  </div>
                )}
                <OpsHub 
                    key={`${pageIndex}-${pageSize}`}
                    dataOpsHubs={jobs || []} 
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

export default withPageErrorBoundary(OpsHubPage, 'OpsHub');
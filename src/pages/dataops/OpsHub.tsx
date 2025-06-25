import { useState } from 'react';
import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import { LoadingState } from '@/components/shared/LoadingState';
import { OpsHub } from '@/features/dataops/OpsHub';
import { useDataOpsHub } from '@/features/dataops/dataOpsHubs/hooks/usedataOpsHub';

function OpsHubPage() {
    const [offset, setOffset] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const { jobs, total, isFetching, next, prev } = useDataOpsHub({
        shouldFetch: true,
        limit: pageSize,
        offset: offset
    });

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

    return (
        <div className="p-6 h-full">
            <div className="relative h-full">
                {isFetching && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <LoadingState fullScreen={false} />
                    </div>
                )}
                <OpsHub
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
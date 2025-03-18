import { fetchData as releaseFetchData } from '@/api/release-api';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ReleaseBundle } from '@/features/dataops/ReleaseBundle';
import { useQuery } from '@tanstack/react-query';
import { Repeat } from 'lucide-react';

function ReleaseBundlePage() {
    const { data: releases, isLoading, isFetching, isError } = useQuery({
        queryKey: ['releases'],
        queryFn: async () => {
            const response = await releaseFetchData();
            return response;
        },
    });
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
    if (releases && releases.length === 0) {
        return (
            <div className="p-6">
                <EmptyState
                    title="Welcome to Release Management!"
                    description="Ready to manage your releases."
                    Icon={Repeat}
                />
            </div>
        );
    }

    return <div className="p-6">
        <div className="relative">
            {isFetching && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <LoadingState className='w-40 h-40' />
                </div>
            )}
            <ReleaseBundle releases={releases || []} />
        </div>
    </div>
}

export default withPageErrorBoundary(ReleaseBundlePage, 'ReleaseBundle');
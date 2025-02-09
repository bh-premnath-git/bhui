import { ReleasesTable } from '@/features/dataops/managerelease/ReleasesTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { getDataSources } from '@/api/get-methods';
import { EmptyState } from '@/components/shared/EmptyState';
import { Package } from 'lucide-react';

const ManageReleases = () => {
  const { data: releases = [], isLoading, error } = getDataSources.releases();

  if (isLoading) {
    return <LoadingState className='w-full min-h-screen' />;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />;
  }

  if (releases.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="Welcome to Your Release Management !"
          description="Ready to manage your releases."
          Icon={Package}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="bg-card rounded-lg shadow-sm">
        <ReleasesTable releases={releases} />
      </div>
    </div>
  );
};

export default ManageReleases;
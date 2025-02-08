import { ReleasesTable } from '@/features/dataops/managerelease/ReleasesTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { getDataSources } from '@/api/get-methods';

const ManageReleases = () => {
  const { data: releases = [], isLoading, error } = getDataSources.releases();

  if (isLoading) {
    return <LoadingState className='w-full min-h-screen' />;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />;
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
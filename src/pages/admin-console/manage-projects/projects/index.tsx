
import { ProjectTable } from '@/features/adminconsole/projects/ProjectTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { getDataSources } from '@/api/get-methods';

const ManageProjects = () => {
  const { data: projects = [], isLoading, error } = getDataSources.manageProjects();

  if (isLoading) {
    return <LoadingState className='w-full min-h-screen'/>;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />;
  }

  return (
    <div className="container">
      <div className="bg-card rounded-lg shadow-sm">
        <ProjectTable projects={projects} />
      </div>
    </div>
  );
};

export default ManageProjects;
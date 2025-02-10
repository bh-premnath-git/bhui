
import { ProjectTable } from '@/features/adminconsole/projects/ProjectTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { getDataSources } from '@/api/get-methods';
import { FolderGit2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

const ManageProjects = () => {
  const { data: projects = [], isLoading, error } = getDataSources.manageProjects();

  if (isLoading) {
    return <LoadingState className='w-full min-h-screen'/>;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />;
  }

  if(projects.length === 0){
    return (
      <div className="container">
          <EmptyState
            title="Welcome to Your Project Management !"
            description="Ready to manage your projects."
            Icon={FolderGit2}
          />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="bg-card rounded-lg shadow-sm">
        <ProjectTable projects={projects || []} />
      </div>
    </div>
  );
};

export default ManageProjects;
import { useEffect } from 'react';
import { FolderGit2 } from 'lucide-react';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useProjects } from '@/features/admin/projects/hooks/useProjects';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ProjectsList } from '@/features/admin/projects/Projects';
import { useProjectManagementServive } from '@/features/admin/projects/services/projMgtSrv';

function ProjectsListPage() {
  const { projects, isLoading, isFetching, isError } = useProjects();
  const projMgntSrv = useProjectManagementServive();
  useEffect(() => {
    if(projects && projects.length > 0){
        projMgntSrv.setProjects(projects);
    }
  }, []);

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

  if (projects?.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="Welcome to Your Project Management!"
          description="Ready to manage your projects."
          Icon={FolderGit2}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingState className='w-40 h-40' />
          </div>
        )}
        <ProjectsList projects={projects || []} />
      </div>
    </div>
  );
}

export default withPageErrorBoundary(ProjectsListPage, 'Projects');

import { useEffect, useState } from 'react';
import { FolderGit2 } from 'lucide-react';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useProjects } from '@/features/admin/projects/hooks/useProjects';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ProjectsList } from '@/features/admin/projects/Projects';
import { useProjectManagementServive } from '@/features/admin/projects/services/projMgtSrv';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';

function ProjectsListPage() {
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { projects, total, isFetching, isLoading, isError, next, prev } = useProjects({
    shouldFetch: true,
    limit: pageSize,
    offset: offset,
  });
  const projMgntSrv = useProjectManagementServive();
  const { handleNavigation } = useNavigation();

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

  useEffect(() => {
    if (Array.isArray(projects) && projects.length > 0) {
      projMgntSrv.setProjects(projects);
    }
  }, [projects, projMgntSrv]);

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
        <ErrorState
          title="Error Loading Projects"
          description="There was an error loading the projects. Please try again later."
        />
      </div>
    );
  }

  if (!Array.isArray(projects) || projects.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          Icon={FolderGit2}
          title="No Projects Found"
          description="Get started by creating a new project."
          action={
            <Button 
              onClick={() => handleNavigation(ROUTES.ADMIN.PROJECTS.ADD)}
              className="mt-4"
            >
              Create Project
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="relative">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <LoadingState classNameContainer="w-40 h-40" />
          </div>
        )}
        <ProjectsList 
          projects={projects}
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

export default withPageErrorBoundary(ProjectsListPage, 'Projects');

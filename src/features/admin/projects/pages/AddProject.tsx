
import { useNavigate } from 'react-router-dom';
import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectMutationData } from '@/types/admin/project';
import { useProjectsContext } from '../context/ProjectsContext';
import { ROUTES } from '@/config/routes';
import { ProjectPageLayout } from '../components/ProjectPageLayout';

function AddProject() {
  const navigate = useNavigate();
  const { handleCreateProject } = useProjectsContext();

  const onSubmit = async (data: ProjectMutationData) => {
    try {
      await handleCreateProject(data);
      navigate(ROUTES.ADMIN.PROJECTS.INDEX);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <ProjectPageLayout
      title="Create New Project"
      description="Configure your project settings and repository details."
    >
      <ProjectForm
        onSubmit={onSubmit}
        mode="create"
      />
    </ProjectPageLayout>
  );
}

export default withPageErrorBoundary(AddProject, 'AddProject');

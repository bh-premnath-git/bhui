
import { useNavigate } from 'react-router-dom';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectMutationData } from '@/types/admin/project';
import { useProjects } from '../hooks/useProjects';
import { ROUTES } from '@/config/routes';
import { ProjectPageLayout } from '../components/ProjectPageLayout';

export function AddProject() {
  const navigate = useNavigate();
  const { handleCreateProject } = useProjects();

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
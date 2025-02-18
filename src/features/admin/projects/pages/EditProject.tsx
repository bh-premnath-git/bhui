
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectMutationData } from '@/types/admin/project';
import { useProjects } from '../hooks/useProjects';
import { ROUTES } from '@/config/routes';
import { ProjectPageLayout } from '../components/ProjectPageLayout';

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { handleUpdateProject, projects } = useProjects();
  
  const project = projects?.find(p => p.id === id);

  const onSubmit = async (data: ProjectMutationData) => {
    try {
      if (id) {
        await handleUpdateProject(id, data);
        navigate(ROUTES.ADMIN.PROJECTS.INDEX);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  if (!project) {
    return <div className="p-6">Project not found</div>;
  }

  return (
    <ProjectPageLayout
      title="Edit Project"
      description="Modify your project settings and repository details."
    >
      <ProjectForm
        initialData={project}
        onSubmit={onSubmit}
        mode="edit"
      />
    </ProjectPageLayout>
  );
}
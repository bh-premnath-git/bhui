import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectForm } from './components/ProjectForm';
import { ProjectFormValues } from './components/projectFormSchema';
import { useProjects } from './hooks/useProjects';
import { ROUTES } from '@/config/routes';
import { ProjectPageLayout } from './components/ProjectPageLayout';

export function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { handleUpdateProject, projects } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const project = projects?.find(p => p.id === id);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (id) {
        // await handleUpdateProject(id, data);
        navigate(ROUTES.ADMIN.PROJECTS.INDEX);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      setError(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!project) {
    return <div className="p-6">Project not found</div>;
  }

  return (
    <ProjectPageLayout
      description="Modify your project settings and repository details."
    >
      <ProjectForm
        initialData={project}
        onSubmit={onSubmit}
        mode="edit"
        isSubmitting={isSubmitting}
        error={error}
      />
    </ProjectPageLayout>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectForm } from './components/ProjectForm';
import { ProjectFormValues } from './components/projectFormSchema';
import { useProjects } from './hooks/useProjects';
import { ROUTES } from '@/config/routes';
import { ProjectPageLayout } from './components/ProjectPageLayout';
import { ProjectMutationData } from '@/types/admin/project';

export function AddProject() {
  const navigate = useNavigate();
  const { handleCreateProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await handleCreateProject(data);
      navigate(ROUTES.ADMIN.PROJECTS.INDEX);
    } catch (error) {
      console.error('Failed to create project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProjectPageLayout
      description="Configure your project settings and repository details."
    >
      <ProjectForm 
        mode="create" 
        onSubmit={onSubmit} 
        isSubmitting={isSubmitting} 
        error={error} 
      />
    </ProjectPageLayout>
  );
}
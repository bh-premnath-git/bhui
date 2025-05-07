import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from "@/store/"
import { useAppSelector } from '@/hooks/useRedux';
import { ProjectForm } from './components/ProjectForm';
import { ProjectFormData, transformFormToApiData } from './components/projectFormSchema';
import { useProjects } from './hooks/useProjects';
import { ROUTES } from '@/config/routes';
import { ProjectPageLayout } from './components/ProjectPageLayout';
import { encrypt_string } from '@/lib/encryption';
import { Project, ProjectGitValidation } from '@/types/admin/project';

const transformProjectToFormData = (project: Project): Partial<ProjectFormData> => {
  let parsedTags = [];
  
  if (project.tags?.tagList && project.tags.tagList !== '*-') {
    if (Array.isArray(project.tags.tagList)) {
      parsedTags = project.tags.tagList;
    } 
    else if (typeof project.tags.tagList === 'string' && project.tags.tagList.trim() !== '') {
      try {
        const parsed = JSON.parse(project.tags.tagList);
        parsedTags = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn('Failed to parse tags:', error);
      }
    }
  }

  const status = project.status === 'inactive' ? 'inactive' : 'active';

  return {
    bh_project_name: project.bh_project_name,
    bh_github_provider: project.bh_github_provider?.toString() || '',
    bh_github_username: project.bh_github_username || '',
    bh_github_email: project.bh_github_email || '',
    bh_default_branch: project.bh_default_branch || '',
    bh_github_url: project.bh_github_url || '',
    bh_github_token_url: '', // Always return empty string for security
    status,
    tags: parsedTags
  };
};

export function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedProject } = useAppSelector((state: RootState) => state.projects);
  const {
    handleUpdateProject,
    handleValidateToken,
    project: interProject,
    isProjectLoading,
    isProjectError
  } = useProjects({ 
    projectId: selectedProject?.bh_project_id ? undefined : id, // Only fetch if we don't have selectedProject
  });

  // Use selectedProject if available, otherwise use fetched project
  const project = selectedProject || interProject;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatedToken, setValidatedToken] = useState<{ encryptedString: string; initVector: string } | null>(null);

  const handleValidateGitHub = async (data: ProjectFormData) => {
    try {
      setError(null);
      setIsValidating(true);
      const { encryptedString, initVector } = encrypt_string(data.bh_github_token_url);

      const validationData: ProjectGitValidation = {
        bh_github_provider: data.bh_github_provider,
        bh_github_username: data.bh_github_username,
        bh_github_url: data.bh_github_url,
        bh_github_token_url: encryptedString,
        init_vector: initVector
      };

      await handleValidateToken(validationData);
      setValidatedToken({ encryptedString, initVector });
    } catch (error) {
      console.error('Failed to validate GitHub token:', error);
      setError(error instanceof Error ? error.message : 'Failed to validate GitHub token');
      setValidatedToken(null);
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (id) {
        // Only require token validation if the token field was filled
        if (data.bh_github_token_url && !validatedToken) {
          setError("Please validate your GitHub token first");
          return;
        }

        const apiData = transformFormToApiData(data);
        
        // Only include token-related data if a new token was provided and validated
        if (validatedToken) {
          await handleUpdateProject(id, {
            ...apiData,
            bh_github_token_url: validatedToken.encryptedString,
            init_vector: validatedToken.initVector
          });
        } else {
          // Don't include token-related fields if no new token was provided
          await handleUpdateProject(id, apiData);
        }
        
        navigate(ROUTES.ADMIN.PROJECTS.INDEX);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      setError(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show loading if we're actually fetching (no selectedProject)
  if (!selectedProject && isProjectLoading) {
    return <div className="p-6">Loading project...</div>;
  }

  // Only show error if we tried to fetch and failed (no selectedProject)
  if (!selectedProject && isProjectError) {
    return <div className="p-6">Project not found</div>;
  }

  if (!project) {
    return <div className="p-6">Project not found</div>;
  }

  const formInitialData = transformProjectToFormData(project);

  return (
    <ProjectPageLayout
      description="Modify your project settings and repository details."
    >
      <ProjectForm
        initialData={formInitialData}
        onSubmit={onSubmit}
        onValidateToken={handleValidateGitHub}
        mode="edit"
        isSubmitting={isSubmitting}
        isValidating={isValidating}
        isTokenValidated={!!validatedToken}
        error={error}
      />
    </ProjectPageLayout>
  );
}
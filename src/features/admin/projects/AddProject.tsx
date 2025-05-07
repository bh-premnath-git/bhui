import { useState } from 'react';
import { ProjectForm } from './components/ProjectForm';
import { useNavigation } from '@/hooks/useNavigation';
import { useProjects, useProjectSearch } from './hooks/useProjects';
import { ROUTES } from '@/config/routes';
import { ProjectPageLayout } from './components/ProjectPageLayout';
import { encrypt_string } from '@/lib/encryption';
import { ProjectFormData, transformFormToApiData } from './components/projectFormSchema';

export function AddProject() {
  const { handleNavigation } = useNavigation()
  const { handleCreateProject, handleValidateToken } = useProjects();
  const { searchedProject, isLoading: searchLoading, projectFound, projectNotFound, debounceSearchProject } = useProjectSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatedToken, setValidatedToken] = useState<{ encryptedString: string; initVector: string } | null>(null);

  const handleValidateGitHub = async (data: ProjectFormData) => {
    try {
      setError(null);
      setIsValidating(true);
      const { encryptedString, initVector } = encrypt_string(data.bh_github_token_url);
      
      const validationData = {
        bh_github_provider: data.bh_github_provider,
        bh_github_username: data.bh_github_username,
        bh_github_email: data.bh_github_email,
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
      if (!validatedToken) {
        setError("Please validate your GitHub token first");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      
      const projectData = transformFormToApiData({
        ...data,
        bh_github_token_url: validatedToken.encryptedString
      });
      
      await handleCreateProject({
        ...projectData,
        init_vector: validatedToken.initVector
      });

      handleNavigation(ROUTES.ADMIN.PROJECTS.INDEX, {}, true);
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
        onValidateToken={handleValidateGitHub}
        isSubmitting={isSubmitting}
        isValidating={isValidating}
        isTokenValidated={!!validatedToken}
        error={error}
        searchedProject={searchedProject}
        searchLoading={searchLoading}
        projectNotFound={projectNotFound}
        onNameChange={debounceSearchProject}
      />
    </ProjectPageLayout>
  );
}
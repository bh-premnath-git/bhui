import { useResource } from '@/hooks/api/useResource';
import { ProjectPaginatedResponse, ProjectMutationData, ProjectGitValidation, Project } from '@/types/admin/project';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UseProjectsOptions {
  shouldFetch?: boolean;
  projectId?: string;
}

export const useProjects = (options: UseProjectsOptions = { shouldFetch: true }) => {
  const {
    getAll,
    getOne,
    createMutation,
    updateMutation,
    deleteMutation,
    createOne
  } = useResource<Project>('bh_project', CATALOG_API_PORT, true);

  const { data: projectsResponse, isLoading, isFetching, isError } = getAll('/bh_project/list/') as {
    data: ProjectPaginatedResponse;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
  };

  const { 
    data: project, 
    isLoading: isProjectLoading, 
    isFetching: isProjectFetching, 
    isError: isProjectError 
  } = options.projectId ? getOne(`/bh_project/${options.projectId}/`) : {
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false
  };

  const validateMutation = createOne('/bh_project/validate-token/');

  const handleCreateProject = async (data: ProjectMutationData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error('Failed to create project');
      throw error;
    }
  };

  const handleUpdateProject = async (id: string, data: ProjectMutationData) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        url: `/bh_project/${id}/`
      });
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
      throw error;
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({
        url: `/bh_project/${id}/`
      });
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
      throw error;
    }
  };

  const handleValidateToken = async (data: ProjectGitValidation) => {
    try {
      await validateMutation.mutateAsync(data);
      toast.success('Token validated successfully');
    } catch (error) {   
      toast.error('Failed to validate token');
      throw error;
    }
  };

  return {
    projects: projectsResponse || [],
    project,
    isLoading,
    isProjectLoading,
    isFetching,
    isProjectFetching,
    isError,
    isProjectError,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleValidateToken
  };
};

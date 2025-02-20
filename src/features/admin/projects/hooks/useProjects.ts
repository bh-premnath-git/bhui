import { useResource } from '@/hooks/api/useResource';
import { ProjectPaginatedResponse, ProjectMutationData } from '@/types/admin/project';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UseProjectsOptions {
  shouldFetch?: boolean;
}

export const useProjects = (options: UseProjectsOptions = { shouldFetch: true }) => {
  const {
    getAll,
    createOne,
    updateOne,
    deleteOne
  } = useResource<ProjectPaginatedResponse>('bh_project', CATALOG_API_PORT, true);

  const { data: projects, isLoading, isFetching, isError } = getAll('/bh_project/list/');
  const createMutation = createOne();
  const updateMutation = updateOne("placeholder-id");
  const deleteMutation = deleteOne("placeholder-id");
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
      await updateMutation.mutateAsync({ id, ...data });
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
      throw error;
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
      throw error;
    }
  };

  const handleValidateToken = async (data: ProjectMutationData) => {
    try {
      await validateMutation.mutateAsync(data);
      toast.success('Token validated successfully');
    } catch (error) {   
      toast.error('Failed to validate token');
      throw error;
    }
  };

  return {
    projects,
    isLoading,
    isFetching,
    isError,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleValidateToken
  };
};

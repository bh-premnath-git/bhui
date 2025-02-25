import { useState, useEffect, useMemo } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import { ProjectPaginatedResponse, ProjectMutationData, ProjectGitValidation, Project } from '@/types/admin/project';
import { toast } from 'sonner';
import { CATALOG_API_PORT } from '@/config/platformenv';

interface UseProjectsOptions {
  shouldFetch?: boolean;
  projectId?: string;
}

interface ApiError extends Error {
  response?: {
    status: number;
    data?: {
      detail?: string;
    };
  };
}

const isProjectNotFoundError = (error: unknown): boolean => {
  const apiError = error as ApiError;
  return (
    apiError?.response?.status === 404 &&
    typeof apiError?.response?.data?.detail === 'string' &&
    apiError.response.data.detail.includes('Project not found')
  );
};

export const useProjects = (options: UseProjectsOptions = { shouldFetch: true }) => {
  const {
    getAll,
    getOne,
    createMutation,
    updateMutation,
    deleteMutation
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

  // Use another instance of useResource for validation
  const validateResource = useResource<Project>('bh_project', CATALOG_API_PORT, true);
  const validateMutation = validateResource.createMutation;

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
      const response = await validateMutation.mutateAsync({
        ...data,
        url: '/bh_project/validate-token/'
      });
      toast.success('Token validated successfully');
      return response;
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

export const useProjectSearch = () => {
  const { getOne } = useResource<Project>('bh_project', CATALOG_API_PORT, true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: searchedProject, isLoading, error } = getOne(`/bh_project/search?params=${searchQuery}`, { 
    enabled: !!searchQuery,
  });

  const projectNotFound = useMemo(() => {
    if (!searchQuery) return false;
    return error && isProjectNotFoundError(error);
  }, [error, searchQuery]);

  const debounceSearchProject = useMemo(() =>
    debounce(
      (query: string) => {
        setSearchQuery(query);
      }, 
      800, 
      { leading: false, trailing: true } // Prevent immediate execution, only trigger after delay
    ),
    []
  );

  useEffect(() => {
    return () => {
      debounceSearchProject.cancel();
      setSearchQuery('');
    };
  }, [debounceSearchProject]);

  return {
    searchedProject: searchQuery ? searchedProject : null,
    searchLoading: isLoading,
    projectNotFound,
    debounceSearchProject,
  };
};

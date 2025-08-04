import { useState, useEffect, useMemo, useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import { ProjectPaginatedResponse, ProjectMutationData, ProjectGitValidation, Project } from '@/types/admin/project';
import { toast } from 'sonner';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

interface UseProjectsOptions {
  shouldFetch?: boolean;
  projectId?: string;
  limit?: number;
  offset?: number;
}

interface ApiErrorOptions {
  action: 'create' | 'update' | 'delete' | 'validate' | 'search' | 'fetch';
  context?: string;
  silent?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
  const { action, context = 'project', silent = false } = options;
  const errorMessage = `Failed to ${action} ${context}`;
  console.error(`${errorMessage}:`, error);
  if (!silent) {
    toast.error(errorMessage);
  }
  return error;
};
export const useProjects = (options: UseProjectsOptions = { shouldFetch: true }) => {
  // For queries - returns Project objects
  const { getOne: getProject, getAll: getAllProjects } = useResource<Project>(
    'bh_project',
    CATALOG_REMOTE_API_URL,
    true
  );

  // For mutations - accepts ProjectMutationData
  const { create: createProject, update: updateProject, remove: removeProject } = useResource<ProjectMutationData>(
    'bh_project',
    CATALOG_REMOTE_API_URL,
    true
  );

  // For validation - accepts ProjectGitValidation
  const { create: validateGit } = useResource<ProjectGitValidation>(
    'bh_project',
    CATALOG_REMOTE_API_URL,
    true
  );

  const queryParams = useMemo(() => ({
    limit: options.limit ?? 10,
    offset: options.offset ?? 0,
  }), [options.limit, options.offset]);

  // List projects with pagination
  const { data: projectsResponse, isLoading, isFetching, isError } = getAllProjects<ProjectPaginatedResponse>({
    url: '/bh_project/list/',
    queryOptions: {
      enabled: options.shouldFetch,
      retry: 2
    },
    params: queryParams
  });

  // Get single project
  const { 
    data: project, 
    isLoading: isProjectLoading, 
    isFetching: isProjectFetching, 
    isError: isProjectError 
  } = getProject({
    url: `/bh_project/${options.projectId}/`,
    queryOptions: {
      enabled: !!options.projectId,
      retry: 2
    }
  });

  // Create project mutation
  const createProjectMutation = createProject({
    url: '/bh_project',
    mutationOptions: {
      onSuccess: () => toast.success('Project created successfully'),
      onError: (error) => {
        handleApiError(error, { action: 'create' });
        return Promise.reject(error);
      },
    },
  });

  // Update project mutation
  const updateProjectMutation = updateProject('/bh_project', {
    mutationOptions: {
      onSuccess: () => toast.success('Project updated successfully'),
      onError: (error) => handleApiError(error, { action: 'update' }),
    },
  });

  // Delete project mutation
  const deleteProjectMutation = removeProject('/bh_project', {
    mutationOptions: {
      onSuccess: () => toast.success('Project deleted successfully'),
      onError: (error) => handleApiError(error, { action: 'delete' }),
    },
  });

  // Validate git token mutation
  const validateTokenMutation = validateGit({
    url: '/bh_project/validate-token/',
    mutationOptions: {
      onSuccess: () => toast.success('Token validated successfully'),
      onError: (error) => handleApiError(error, { action: 'validate' }),
    },
  });

  // Type-safe mutation handlers
  const handleCreateProject = useCallback(async (data: ProjectMutationData) => {
    await createProjectMutation.mutateAsync({
      data
    });
  }, [createProjectMutation]);

  const handleUpdateProject = useCallback(async (id: string, data: ProjectMutationData) => {
    await updateProjectMutation.mutateAsync({
      data,
      params: { id }
    });
  }, [updateProjectMutation]);

  const handleDeleteProject = useCallback(async (id: string) => {
    await deleteProjectMutation.mutateAsync({
      params: { id }
    });
  }, [deleteProjectMutation]);

  const handleValidateToken = useCallback(async (data: ProjectGitValidation) => {
    const response = await validateTokenMutation.mutateAsync({
      data
    });
    return response;
  }, [validateTokenMutation]);

  const projects = projectsResponse?.data || [];
  const total = projectsResponse?.total || 0;
  const offset = projectsResponse?.offset || 0;
  const limit = projectsResponse?.limit || 0;
  const prev = projectsResponse?.prev || false;
  const next = projectsResponse?.next || false;

  return {
    projects,
    project,
    isLoading,
    isProjectLoading,
    isFetching,
    isProjectFetching,
    isError,
    isProjectError,
    total,
    offset,
    limit,
    prev,
    next,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleValidateToken
  };
};

export function useProjectSearch() {
  const { projects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');

  const searchedProject =
    searchQuery.trim() !== ''
      ? projects.find(
          (proj) =>
            proj.bh_project_name?.trim().toLowerCase() ===
            searchQuery.trim().toLowerCase()
        ) || null
      : null;

  const debounceSearchProject = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 800),
    []
  );

  useEffect(() => {
    return () => debounceSearchProject.cancel();
  }, [debounceSearchProject]);

  return {
    searchedProject,
    projectFound: !!searchedProject,
    projectNotFound: searchQuery.trim() !== '' && !searchedProject,
    isBlankQuery: searchQuery.trim() === '',
    isLoading: false,
    error: null,
    debounceSearchProject,
  };
}

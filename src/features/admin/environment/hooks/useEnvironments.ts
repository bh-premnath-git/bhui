import { useState, useEffect, useMemo, useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import { Environment, EnvironmentMutationData, AWSValidationData, MWAAEnvironments, EnvironmentListResponse } from '@/types/admin/environment';
import { toast } from 'sonner';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

interface UseEnvironmentsOptions {
  shouldFetch?: boolean;
  environmentId?: string;
  limit?: number;
  offset?: number;
  mwaaQueryParams?: {
    bh_env_name?: string;
    location?: string;
  };
}

interface ApiErrorOptions {
  action: 'create' | 'update' | 'delete' | 'search' | 'fetch';
  context?: string;
  silent?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
  const { action, context = 'environment', silent = false } = options;
  const errorMessage = `Failed to ${action} ${context}`;
  console.error(`${errorMessage}:`, error);
  if (!silent) {
    toast.error(errorMessage);
  }
  throw error;
};

export const useEnvironments = (options: UseEnvironmentsOptions = { shouldFetch: true }) => {
  // For queries - returns Environment objects
  const { getOne: getEnvironment, getAll: getAllEnvironments } = useResource<Environment | MWAAEnvironments>(
    'environments',
    CATALOG_REMOTE_API_URL,
    true
  );

  // For mutations - accepts EnvironmentMutationData
  const { create: createEnvironment, create: createValidation, update: updateEnvironment, remove: removeEnvironment } = useResource<EnvironmentMutationData | AWSValidationData>(
    'environments',
    CATALOG_REMOTE_API_URL,
    true
  );

  const queryParams = useMemo(() => ({
    limit: options.limit ?? 10,
    offset: options.offset ?? 0,
  }), [options.limit, options.offset]);

  // List environments
  const { data: environments, isLoading, isFetching, isError } = getAllEnvironments<EnvironmentListResponse>({
    url: '/environment/environment/list/',
    queryOptions: {
      enabled: options.shouldFetch,
      retry: 2
    },
    params: queryParams
  });

  // Get single environment
  const {
    data: environment,
    isLoading: isEnvironmentLoading,
    isFetching: isEnvironmentFetching,
    isError: isEnvironmentError
  } = options.environmentId ? getEnvironment({
    url: `/environment/environment/${options.environmentId}`,
    queryOptions: {
      enabled: !!options.environmentId,
      retry: 2
    }
  }) : {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false
    };

  // Create environment mutation
  const createEnvironmentMutation = createEnvironment({
    url: '/environment/environment',
    mutationOptions: {
      onSuccess: () => toast.success('Environment created successfully'),
      onError: (error) => handleApiError(error, { action: 'create' }),
    },
  });

  // Update environment mutation
  const updateEnvironmentMutation = updateEnvironment('/environment/environment/', {
    mutationOptions: {
      onSuccess: () => toast.success('Environment updated successfully'),
      onError: (error) => handleApiError(error, { action: 'update' }),
    },
  });

  // Delete environment mutation
  const deleteEnvironmentMutation = removeEnvironment('/environment/environment', {
    mutationOptions: {
      onSuccess: () => toast.success('Environment deleted successfully'),
      onError: (error) => handleApiError(error, { action: 'delete' }),
    },
  });

  // AWS validation mutation
  const AWSValidationMutation = createValidation({
    url: '/aws/test_connection',
    mutationOptions: {
      onSuccess: () => toast.success('Validation successful'),
      onError: (error) => handleApiError(error, { action: 'create', context: 'AWS validation', silent: true }),
    },
  });

  // Type-safe mutation handlers
  const handleCreateEnvironment = useCallback(async (data: FormData) => {
    await createEnvironmentMutation.mutateAsync({
      data
    });
  }, [createEnvironmentMutation]);

  const handleUpdateEnvironment = useCallback(async (id: string, data: EnvironmentMutationData | any) => {
    await updateEnvironmentMutation.mutateAsync({
      data,
      url: `/environment/environment/${id}`
    });
  }, [updateEnvironmentMutation]);

  const handleDeleteEnvironment = useCallback(async (id: string) => {
    await deleteEnvironmentMutation.mutateAsync({
      query: id
    });
  }, [deleteEnvironmentMutation]);

  const handleAWSValidation = useCallback(async (bh_env_name: string, data: AWSValidationData) => {
    return await AWSValidationMutation.mutateAsync({
      query: `bh_env_name=${bh_env_name}`,
      data,
    });
  }, [AWSValidationMutation]);

  const environmentData = environments?.data || [];
  const total = environments?.total || 0;
  const offset = environments?.offset || 0;
  const limit = environments?.limit || 0;
  const prev = environments?.prev || false;
  const next = environments?.next || false;

  return {
    environments: environmentData,
    environment,
    isLoading,
    isEnvironmentLoading,
    isFetching,
    isEnvironmentFetching,
    isError,
    isEnvironmentError,
    total,
    offset,
    limit,
    prev,
    next,
    handleCreateEnvironment,
    handleAWSValidation,
    handleUpdateEnvironment,
    handleDeleteEnvironment
  };
};

export const useEnvironmentSearch = () => {
  const { getOne: getEnvironment } = useResource<Environment>(
    'environments',
    CATALOG_REMOTE_API_URL,
    true
  );

  const [searchQuery, setSearchQuery] = useState('');

  const { data: searchedEnvironment, isLoading, error } = getEnvironment({
    url: `/environment/environment/${searchQuery}/`,
    queryOptions: {
      enabled: !!searchQuery,
      retry: 2
    }
  });

  const environmentNotFound = useMemo(() => {
    if (!error) return false;
    const apiError = error as { response?: { status: number; data?: { detail?: string } } };
    return (
      apiError?.response?.status === 404 &&
      typeof apiError?.response?.data?.detail === 'string' &&
      apiError.response.data.detail.includes('Environment not found')
    );
  }, [error]);

  const debounceSearchEnvironment = useMemo(() =>
    debounce((query: string) => {
      setSearchQuery(query);
    }, 500),
    []
  );

  useEffect(() => {
    return () => debounceSearchEnvironment.cancel();
  }, [debounceSearchEnvironment]);

  return {
    searchedEnvironment: searchedEnvironment || null,
    searchLoading: isLoading,
    environmentNotFound,
    debounceSearchEnvironment,
  };
};


export const useMwaaEnvironments = ({ mwaaQueryParams }: { mwaaQueryParams?: { bh_env_name: string; location: string } }) => {
  const { getOne: getMwaaEnvironments } = useResource<string[]>(  
    'mwaaEnvironments',  
    CATALOG_REMOTE_API_URL,  
    true  
  );  
  const { data, isLoading, error } = getMwaaEnvironments({  
    url: '/bh_airflow/list-airflow-environments',  
    params: mwaaQueryParams,  
    queryOptions: {  
      enabled: !!mwaaQueryParams, // Only fetch when mwaaQueryParams is truthy  
    },  
  });  
  return {  
    data,  
    isLoading,  
    error  
  };  
};

export const useAirflowEnvironment = ({ airflowParams }: {airflowParams?:  { airflow_env_name: string, bh_env_name: string; location: string }}) =>{
  const {getOne: getAirflowEnv} = useResource<{ }>(
    'bh_airflow',
    CATALOG_REMOTE_API_URL,
    true
  );
  const { data, isLoading, error } = getAirflowEnv({  
    url: '/bh_airflow/get_airflow_environment',  
    params: airflowParams,  
    queryOptions: {  
      enabled: !!airflowParams,
    },  
  });  
  return {  
    data,  
    isLoading,  
    error  
  };  
}
import { useCallback, useMemo } from "react";
import { useResource } from "@/hooks/api/useResource";
import { DataOpsHub, DataOpsHubListResponse } from "@/types/dataops/dataOpsHub";
import { toast } from "sonner";
import { AUDIT_REMOTE_URL } from "@/config/platformenv";

interface UseDataOpsHubOptions {
  shouldFetch?: boolean;
  jobId?: string;
  limit?: number;
  offset?: number;
}

interface ApiErrorOptions {
  action: 'create' | 'update' | 'delete' | 'fetch';
  context?: string;
  silent?: boolean;
}

const handleApiError = (error: unknown, options: ApiErrorOptions) => {
  const { action, context = 'job', silent = false } = options;
  const errorMessage = `Failed to ${action} ${context}`;
  console.error(`${errorMessage}:`, error);
  if (!silent) {
    toast.error(errorMessage);
  }
  throw error;
};

export const useDataOpsHub = (options: UseDataOpsHubOptions = { shouldFetch: true }) => {
  // For queries
  const { getOne: getJob, getAll: getAllJobs } = useResource<DataOpsHub>(
    'job_details',
    AUDIT_REMOTE_URL,
    true
  );

  // For mutations
  const { 
    create: createJob,
    update: updateJob,
    remove: removeJob
  } = useResource<DataOpsHub>(
    'job_details',
    AUDIT_REMOTE_URL,
    true
  );

  const queryParams = useMemo(() => ({
    limit: options.limit ?? 10,
    offset: options.offset ?? 0,
    order_by: 'created_at',
    order_desc: true
  }), [options.limit, options.offset]);

  const { 
    data: jobListResponse,
    isLoading,
    isFetching,
    isError,
  } = getAllJobs<DataOpsHubListResponse, any>({
    url: '/job_details/list/',
    queryOptions: {
      enabled: options.shouldFetch,
      retry: 2,
    },
    params: queryParams
  });

  // Fetch single job by ID
  const fetchJobById = (jobId: string, enabled = true) =>
    getJob({
      url: `/job_details/${jobId}`,
      queryOptions: {
        enabled,
        retry: 2
      }
    });

  // Create job mutation
  const createJobMutation = createJob({
    url: '/job_details/create/',
    mutationOptions: {
      onSuccess: () => toast.success('Job created successfully'),
      onError: (error) => handleApiError(error, { action: 'create' }),
    },
  });

  // Update job mutation
  const updateJobMutation = updateJob('/job_details', {
    mutationOptions: {
      onSuccess: () => toast.success('Job updated successfully'),
      onError: (error) => handleApiError(error, { action: 'update' }),
    },
  });

  // Delete job mutation
  const deleteJobMutation = removeJob('/job_details', {
    mutationOptions: {
      onSuccess: () => toast.success('Job deleted successfully'),
      onError: (error) => handleApiError(error, { action: 'delete' }),
    },
  });

  // Type-safe mutation handlers
  const handleCreateJob = useCallback(async (data: DataOpsHub) => {
    await createJobMutation.mutateAsync({
      data
    });
  }, [createJobMutation]);

  const handleUpdateJob = useCallback(async (id: string, data: DataOpsHub) => {
    await updateJobMutation.mutateAsync({
      data,
      url: `/job_details/${id}/`
    });
  }, [updateJobMutation]);

  const handleDeleteJob = useCallback(async (id: string) => {
    await deleteJobMutation.mutateAsync({
      params: { id }
    });
  }, [deleteJobMutation]);

  const jobs = jobListResponse?.data || [];
  const total = jobListResponse?.total || 0;
  const offset = jobListResponse?.offset || 0;
  const limit = jobListResponse?.limit || 0;
  const prev = jobListResponse?.prev || false;
  const next = jobListResponse?.next || false;

  // Get single job if ID is provided
  const { 
    data: job,
    isLoading: isJobLoading,
    isFetching: isJobFetching,
    isError: isJobError 
  } = fetchJobById(options.jobId || '', options.shouldFetch && !!options.jobId);

  return {
    // Query results
    jobs,
    job: job || null,
    isLoading,
    isFetching,
    isError,
    isJobLoading,
    isJobFetching,
    isJobError,
    total,
    offset,
    limit,
    prev,
    next,
    // Query functions
    fetchJobById,

    // Mutation handlers
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
  };
};

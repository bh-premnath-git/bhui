import { useResource } from "@/hooks/api/useResource";
import { TaskDetails } from '@/types/dataops/dataOpsHub';
import { AUDIT_PORT } from "@/config/platformenv";

interface UseTaskDetailsOptions {
  shouldFetch?: boolean;
  jobId?: string;
}

export const useTaskDetails = (options: UseTaskDetailsOptions = { shouldFetch: true }) => { 
    const { 
        getAll, 
    } = useResource<TaskDetails>('task_details', AUDIT_PORT, true);

    const { data: taskDetails, isLoading, isFetching, isError } = getAll('/task_details/list/', {job_id: options.jobId});

    return {
        taskDetails: taskDetails || [],
        isLoading,
        isFetching,
        isError,
    };
}

import { useResource } from "@/hooks/api/useResource";
import { TaskDetails } from '@/types/dataops/dataOpsHub';
import { AUDIT_PORT } from "@/config/platformenv";
import { useEffect } from "react";
import { toast } from "sonner";

interface UseTaskDetailsOptions {
    shouldFetch?: boolean;
    jobId?: string;
  }

  export const useTaskDetails = (options: UseTaskDetailsOptions = { shouldFetch: true }) => { 
    const {  getAll: getAllTaskDetails } = useResource<TaskDetails>(
        'task_details',
        AUDIT_PORT,
        true
    );

    const { data: taskDetails, isLoading, isFetching, isError, error, refetch } = getAllTaskDetails({
        url: '/task_details/list/',
        params: options.jobId ? { job_id: options.jobId } : undefined,
        queryOptions: {
            enabled: options.shouldFetch && !!options.jobId,
            retry: 2
        }
    });

    useEffect(() => {
        if (error) {
            const errorMessage = 'Failed to fetch Task Details fields';
            console.error(`${errorMessage}:`, error);
            toast.error(errorMessage);
        }
    }, [error]);

    const taskDetail = taskDetails?.[0] || null;

    return {
        taskDetail,
        isLoading,
        isFetching,
        isError,
        refetch, 
    };    
};

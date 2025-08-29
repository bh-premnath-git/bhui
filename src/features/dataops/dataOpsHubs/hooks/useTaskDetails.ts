import { useResource } from "@/hooks/api/useResource";
import { TaskDetails, TaskDetailsListResponse } from '@/types/dataops/dataOpsHub';
import { AUDIT_REMOTE_URL } from "@/config/platformenv";
import { useEffect } from "react";
import { toast } from "sonner";

interface UseTaskDetailsOptions {
    shouldFetch?: boolean;
    jobId?: string;
    limit?: number;
    offset?: number;
}

export const useTaskDetails = (options: UseTaskDetailsOptions = { shouldFetch: true }) => { 
    const {  getAll: getAllTaskDetails } = useResource<TaskDetails>(
        'task_details',
        AUDIT_REMOTE_URL,
        true
    );

    const queryParams = {
        ...(options.jobId && { job_id: options.jobId }),
        limit: options.limit ?? 10,
        offset: options.offset ?? 0,
    };

    const { data: taskDetailsResponse, isLoading, isFetching, isError, error, refetch } = getAllTaskDetails<TaskDetailsListResponse, any>({
        url: '/task_details/list/',
        params: queryParams,
        queryOptions: {
            enabled: options.shouldFetch && !!options.jobId,
            retry: 2
        }
    });

    useEffect(() => {
        if (error) {
            const errorMessage = 'Failed to fetch Task Details';
            console.error(`${errorMessage}:`, error);
            toast.error(errorMessage);
        }
    }, [error]);

    const taskDetails = taskDetailsResponse?.data || [];
    const total = taskDetailsResponse?.total || 0;
    const offset = taskDetailsResponse?.offset || 0;
    const limit = taskDetailsResponse?.limit || 0;
    const prev = taskDetailsResponse?.prev || false;
    const next = taskDetailsResponse?.next || false;

    return {
        taskDetails,
        isLoading,
        isFetching,
        isError,
        refetch, 
        total,
        offset,
        limit,
        prev,
        next,
    };    
};

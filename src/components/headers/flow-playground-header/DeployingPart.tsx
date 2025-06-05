import { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from "@/store/";
import { fetchDagParserTime } from '@/store/slices/designer/flowSlice';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export const DeployingPart = () => {
    const dispatch = useAppDispatch();
    const { selectedFlow, selectedEnvironment, error, dagParserTime, loading } =
        useAppSelector((state: RootState) => state.flow);

    useEffect(() => {
        if (selectedFlow?.flow_name && selectedEnvironment?.airflow_env_name && selectedEnvironment?.bh_env_name) {
            // Replace spaces with underscores in dag_id to match API expectations
            const formattedDagId = selectedFlow.flow_name.replace(/\s+/g, '_');
            
            dispatch(fetchDagParserTime({
                dag_id: formattedDagId,
                airflow_env_name: selectedEnvironment.airflow_env_name,
                bh_env_name: selectedEnvironment.bh_env_name
            }));
        }
    }, [dispatch, selectedFlow?.flow_name, selectedEnvironment]);

    const formatDagParserTime = (time: string | null): string => {
        if (!time) return "none";
        const date = new Date(time);
        if (isNaN(date.getTime())) return "Invalid date";
        return date.toLocaleString();
    };

    // Determine icon color based on status
    const getIconColorClass = () => {
        if (loading) return "text-gray-400";
        if (error) return "text-red-500 dark:text-red-400";
        if (dagParserTime) return "text-green-500 dark:text-green-400";
        return "text-gray-500 dark:text-gray-400"; // Default/none state
    };

    return (
        <div className="flex items-center">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="p-1">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={`rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'animate-pulse' : ''}`}
                                        aria-label="Deployment status"
                                    >
                                        <Clock className={`h-5 w-5 ${getIconColorClass()}`} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4 bg-white dark:bg-gray-800 rounded-md shadow-md">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Deployment Information</h4>
                                        <div className="flex items-center gap-2">
                                            {error ? (
                                                <>
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-red-600 dark:text-red-400 text-sm font-normal">Failed to fetch deployment time</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className={`h-4 w-4 ${getIconColorClass()}`} />
                                                    <span className="text-gray-700 dark:text-gray-300 text-sm font-normal">
                                                        Last deployed: <span className="font-medium">{formatDagParserTime(dagParserTime)}</span>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {selectedFlow?.flow_name && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                DAG ID: <span className="font-medium">{selectedFlow.flow_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>

                            </Popover>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Last DAG parser time</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};


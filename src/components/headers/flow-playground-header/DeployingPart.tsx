import { useEffect } from 'react';
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

export const DeployingPart = () => {
    const dispatch = useAppDispatch();
    const { selectedFlow, selectedEnvironment, error, dagParserTime, loading } = 
        useAppSelector((state: RootState) => state.flow);

    useEffect(() => {
        if (selectedFlow?.flow_name && selectedEnvironment?.airflow_env_name && selectedEnvironment?.bh_env_name) {
            dispatch(fetchDagParserTime({
                dag_id: selectedFlow.flow_name,
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

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div 
                        className={`flex items-center px-3 py-1.5 rounded-md text-sm transition-colors duration-200 ease-in-out
                            ${loading ? 'opacity-70' : ''} 
                            ${error 
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' 
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80'
                            }`}
                    >
                        <Clock className="h-4 w-4 text-current opacity-70" />
                        <time
                            className="whitespace-nowrap"
                            dateTime={dagParserTime || undefined}
                        >
                            Last deployed: <span className="font-medium">{formatDagParserTime(dagParserTime)}</span>
                        </time>
                        {error && (
                            <AlertCircle className="h-4 w-4 text-current" />
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    {error ? (
                        <p className="text-red-600 dark:text-red-400">Failed to fetch deployment time</p>
                    ) : (
                        <p>Last DAG parser time</p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
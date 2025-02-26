import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Pause, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from "@/store/";
import { updateFlowDefinition, triggerDagDeployment, setDagRunId } from '@/store/slices/designer/flowSlice';
import { toast } from 'sonner';

interface Task {
    task_id: string;
    [key: string]: any;
}

function areAllTaskIdsValid(tasks: Task[]): boolean {
    return tasks.every(task => !!task.task_id);
}

export const PlaybackButton = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { selectedFlow, selectedEnvironment, loading, dagParserTime } = useAppSelector((state: RootState) => state.flow);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [prevPathname, setPrevPathname] = useState(location.pathname);

    useEffect(() => {
        if (location.pathname !== prevPathname && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setPrevPathname(location.pathname);
    }, [location.pathname, prevPathname]);

    const updateFlowDef = async () => {
        if (!selectedFlow?.flow_id || isPlaying) return;

        try {
            const flowStructure = localStorage.getItem(`flow-${selectedFlow.flow_id}`);
            if (!flowStructure) {
                toast.error("No flow structure found");
                return;
            }

            const parsedStructure = JSON.parse(flowStructure);
            const flowJson = parsedStructure.nodeFormData?.map((item: any) => item.formData);

            if (!areAllTaskIdsValid(flowJson)) {
                toast.error("Please check all tasks have valid IDs");
                return;
            }

            await dispatch(updateFlowDefinition({
                flow_id: selectedFlow.flow_id.toString(),
                flow_json: {
                    flow_deployment_id: selectedFlow.flow_deployment?.[0]?.flow_deployment_id,
                    flow_id: selectedFlow.flow_id.toString(),
                    flow_json: { flowJson, flowStructure: parsedStructure }
                }
            })).unwrap();

            toast.success("Flow definition updated successfully");
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                console.log('Flow definition update was aborted');
            } else {
                toast.error("Failed to update flow definition");
            }
        }
    };

    const deployFlow = async (): Promise<boolean> => {
        if (!selectedFlow?.flow_name || !selectedEnvironment?.airflow_env_name || !selectedEnvironment?.bh_env_name) {
            toast.error("Missing required deployment information");
            return false;
        }

        try {
            const result = await dispatch(triggerDagDeployment({
                dag_id: selectedFlow.flow_name,
                airflow_env_name: selectedEnvironment.airflow_env_name,
                bh_env_name: selectedEnvironment.bh_env_name
            })).unwrap();

            dispatch(setDagRunId({
                dag_run_id: result.dag_run_id,
                dag_id: selectedFlow.flow_name
            }));

            toast.success("Deployment started successfully");
            return true;
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                console.log('Flow deployment was aborted');
            } else {
                toast.error("Failed to deploy flow");
            }
            return false;
        }
    };

    const handleClick = async () => {
        setIsLoading(true);
        try {
            if (!isPlaying) {
                await updateFlowDef();
                const success = await deployFlow();
                if (success) {
                    setIsPlaying(true);
                }
            } else {
                setIsPlaying(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleClick}
                        disabled={loading || !dagParserTime || isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isPlaying ? (
                            <Pause className="h-4 w-4" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                    <p>{isPlaying ? "Stop Deployment" : "Start Deployment"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
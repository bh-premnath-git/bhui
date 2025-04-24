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
import { triggerDagDeployment, setDagRunId, deployDag } from '@/store/slices/designer/flowSlice';
import { toast } from 'sonner';
import { useFlow } from '@/context/designers/FlowContext';

export const PlaybackButton = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { selectedFlow, selectedEnvironment } = useAppSelector((state: RootState) => state.flow);
    const { isPlaying, togglePlayback } = useFlow();
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [prevPathname, setPrevPathname] = useState(location.pathname);

    
    useEffect(() => {
        if (location.pathname !== prevPathname && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setPrevPathname(location.pathname);
    }, [location.pathname, prevPathname]);

    const deployFlow = async (): Promise<boolean> => {
        if (!selectedFlow?.flow_name || !selectedEnvironment?.airflow_env_name || !selectedEnvironment?.bh_env_name) {
            toast.error("Missing required deployment information");
            return false;
        }

        try {
            const result = await dispatch(triggerDagDeployment({
                dag_id: selectedFlow.flow_key,
                airflow_env_name: selectedEnvironment.airflow_env_name,
                bh_env_name: selectedEnvironment.bh_env_name
            })).unwrap();

            dispatch(setDagRunId({
                dag_run_id: result.dag_run_id,
                airflow_env_name: selectedEnvironment.airflow_env_name,
                dag_id: selectedFlow.flow_key,
                bh_env_name: selectedEnvironment.bh_env_name
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
            if (!selectedFlow?.flow_definition?.flow_definition_id || !selectedFlow?.flow_deployment?.[0]?.flow_deployment_id) {
                toast.error("Missing flow definition or deployment ID for deployment.");
                setIsLoading(false);
                return;
            }

            // First, call deployDag
            await dispatch(deployDag({
                flow_definition_id: selectedFlow.flow_definition.flow_definition_id,
                flow_deployment_id: selectedFlow.flow_deployment[0].flow_deployment_id
            })).unwrap();

            toast.info("Initial deployment step successful. Proceeding..."); // Optional feedback

            // Proceed with original logic only if deployDag was successful
            if (!isPlaying) {
                const success = await deployFlow(); // deployFlow now handles triggerDagDeployment
                if (success) {
                    togglePlayback();
                }
            } else {
                // Logic for stopping: Should we stop if already playing?
                // For now, assuming stop only toggles the state without further API calls here.
                togglePlayback(); 
                toast.info("Playback stopped."); // Optional feedback
            }
        } catch (error) {
            // Catch errors from deployDag or deployFlow
            console.error("Error during deployment process:", error);
            toast.error(`Deployment process failed: ${(error as Error).message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="flex items-center p-0.25">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-1"
                            onClick={handleClick}
                        >
                            {isLoading ? (
                                <Loader2 className="h-2 w-2 animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="h-2 w-2 text-red-500" />
                            ) : (
                                <Play className="h-2 w-2 text-green-500" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="center">
                        <p>{isPlaying ? "Stop Deployment" : "Start Deployment"}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};
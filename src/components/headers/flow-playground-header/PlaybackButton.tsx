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
import { cn } from '@/lib/utils';

// Deployment state enum for better type safety and readability
enum DeploymentState {
    INITIAL = 'initial',
    READY = 'ready',
    PLAYING = 'playing'
}

export const PlaybackButton = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { selectedFlow, selectedEnvironment } = useAppSelector((state: RootState) => state.flow);
    const { isPlaying, togglePlayback } = useFlow();
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [prevPathname, setPrevPathname] = useState(location.pathname);
    const [deploymentState, setDeploymentState] = useState<DeploymentState>(DeploymentState.INITIAL);
    
    useEffect(() => {
        if (location.pathname !== prevPathname && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setPrevPathname(location.pathname);
    }, [location.pathname, prevPathname]);

    // Reset to initial state when flow or environment changes
    useEffect(() => {
        setDeploymentState(DeploymentState.INITIAL);
    }, [selectedFlow?.flow_key, selectedEnvironment?.airflow_env_name, selectedEnvironment?.bh_env_name]);

    // Update deployment state when isPlaying changes
    useEffect(() => {
        if (isPlaying) {
            setDeploymentState(DeploymentState.PLAYING);
        } else if (deploymentState === DeploymentState.PLAYING) {
            setDeploymentState(DeploymentState.READY);
        }
    }, [isPlaying]);

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
            // Initial state: First click should only call deployDag
            if (deploymentState === DeploymentState.INITIAL) {
                if (!selectedFlow?.flow_definition?.flow_definition_id || !selectedFlow?.flow_deployment?.[0]?.flow_deployment_id) {
                    toast.error("Missing flow definition or deployment ID for deployment.");
                    return;
                }

                // First, call deployDag
                await dispatch(deployDag({
                    flow_definition_id: selectedFlow.flow_definition.flow_definition_id,
                    flow_deployment_id: selectedFlow.flow_deployment[0].flow_deployment_id
                })).unwrap();

                toast.success("Initial deployment ready. Click again to start deployment.");
                setDeploymentState(DeploymentState.READY);
            } 
            // Ready state: Second click should trigger the DAG deployment
            else if (deploymentState === DeploymentState.READY) {
                const success = await deployFlow();
                if (success) {
                    togglePlayback();
                    setDeploymentState(DeploymentState.PLAYING);
                }
            } 
            // Playing state: Click should stop the deployment
            else if (deploymentState === DeploymentState.PLAYING) {
                togglePlayback();
                setDeploymentState(DeploymentState.READY);
                toast.info("Deployment stopped.");
            }
        } catch (error) {
            console.error("Error during deployment process:", error);
            toast.error(`Deployment process failed: ${(error as Error).message || 'Unknown error'}`);
            // Reset to initial state on error
            setDeploymentState(DeploymentState.INITIAL);
        } finally {
            setIsLoading(false);
        }
    };

    // Get button display properties based on current state
    const getButtonDisplay = () => {
        if (isLoading) {
            return { 
                icon: <Loader2 className="h-4 w-4 animate-spin" />,
                tooltip: "Loading...",
                className: "bg-slate-100 dark:bg-slate-800"
            };
        }
        
        switch (deploymentState) {
            case DeploymentState.INITIAL:
                return {
                    icon: <Play className="h-4 w-4" />,
                    tooltip: "Deploy Deployment",
                    className: "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                };
            case DeploymentState.READY:
                return {
                    icon: <Play className="h-4 w-4" />,
                    tooltip: "Start Deployment",
                    className: "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                };
            case DeploymentState.PLAYING:
                return {
                    icon: <Pause className="h-4 w-4" />,
                    tooltip: "Pause Deployment",
                    className: "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                };
            default:
                return {
                    icon: <Play className="h-4 w-4" />,
                    tooltip: "Deploy Deployment",
                    className: "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                };
        }
    };

    const buttonDisplay = getButtonDisplay();

    return (
        <TooltipProvider>
            <div className="flex items-center">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="sm"
                            className={cn(
                                "w-8 h-8 p-0 rounded-full transition-all duration-200 shadow-sm",
                                buttonDisplay.className
                            )}
                            onClick={handleClick}
                        >
                            {buttonDisplay.icon}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent 
                        side="bottom" 
                        align="center"
                        className="font-medium bg-slate-800 text-white dark:bg-slate-700 px-3 py-1.5"
                    >
                        <p>{buttonDisplay.tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};
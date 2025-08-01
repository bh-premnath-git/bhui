import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Pause, Loader2, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from "@/store/";
import { triggerDagDeployment, setDagRunId, deployDag, fetchDagParserTime } from '@/store/slices/designer/flowSlice';
import { toast } from 'sonner';
import { useFlow } from '@/context/designers/FlowContext';
import { cn } from '@/lib/utils';

// Deployment state enum for better type safety and readability
enum DeploymentState {
    INITIAL = 'initial',
    DEPLOYING = 'deploying',
    READY = 'ready',
    PLAYING = 'playing'
}

export const PlaybackButton = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { selectedFlow, selectedEnvironment, dagParserTime } = useAppSelector((state: RootState) => state.flow);
    const { isPlaying, togglePlayback } = useFlow();
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [prevPathname, setPrevPathname] = useState(location.pathname);
    const [deploymentState, setDeploymentState] = useState<DeploymentState>(DeploymentState.INITIAL);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    useEffect(() => {
        if (location.pathname !== prevPathname && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setPrevPathname(location.pathname);
    }, [location.pathname, prevPathname]);

    // Reset to initial state when flow or environment changes
    useEffect(() => {
        setDeploymentState(DeploymentState.INITIAL);
        
        // Clear any existing polling interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, [selectedFlow?.flow_key, selectedEnvironment?.airflow_env_name, selectedEnvironment?.bh_env_name]);

    // Update deployment state when isPlaying changes
    useEffect(() => {
        if (isPlaying) {
            setDeploymentState(DeploymentState.PLAYING);
        } else if (deploymentState === DeploymentState.PLAYING) {
            setDeploymentState(DeploymentState.READY);
        }
    }, [isPlaying]);
    
    // Effect to handle dagParserTime changes
    useEffect(() => {
        // If we're in DEPLOYING state and dagParserTime becomes available, move to READY state
        if (deploymentState === DeploymentState.DEPLOYING && dagParserTime) {
            setDeploymentState(DeploymentState.READY);
            
            // Clear polling interval as we've received the time
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            
            toast.success("Deployment is ready. Click again to start execution.");
        }
    }, [dagParserTime, deploymentState]);
    
    // Cleanup polling interval on component unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const deployFlow = async (): Promise<boolean> => {
        console.log("Deploying flow with selectedEnvironment:", selectedEnvironment);
        const airflowEnvName = selectedEnvironment?.bh_airflow?.[0]?.airflow_env_name;
        if (!selectedFlow?.flow_name || !airflowEnvName || !selectedEnvironment?.bh_env_name) {
            toast.error("Missing required deployment information");
            return false;
        }

        try {
            // Replace spaces with underscores in flow_key if it's used as dag_id
            const formattedDagId = selectedFlow.flow_key.replace(/\s+/g, '_');
            const result:any = await dispatch(triggerDagDeployment({
                dag_id: formattedDagId,
                airflow_env_name: airflowEnvName,
                bh_env_name: selectedEnvironment.bh_env_name
            })).unwrap();

            dispatch(setDagRunId({
                dag_run_id: result.trigger_response?.dag_run_id,
                airflow_env_name: airflowEnvName,
                dag_id: formattedDagId,
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

    // Function to start polling for dagParserTime
    const startPollingDagParserTime = () => {
        console.log("startPollingDagParserTime called");
        
        // Clear any existing interval first
        if (pollingIntervalRef.current) {
            console.log("Clearing existing polling interval");
            clearInterval(pollingIntervalRef.current);
        }
        
        // Start a new polling interval
        console.log("Setting up new polling interval (5 seconds)");
        pollingIntervalRef.current = setInterval(() => {
            console.log("Polling interval triggered - checking conditions...");
            console.log("selectedFlow:", selectedFlow?.flow_name);
            console.log("selectedEnvironment:", selectedEnvironment);
            
            const airflowEnvName = selectedEnvironment?.bh_airflow?.[0]?.airflow_env_name;
            if (selectedFlow?.flow_name && airflowEnvName && selectedEnvironment?.bh_env_name) {
                console.log("Conditions met - calling fetchDagParserTime with dag_id:", selectedFlow.flow_key);
                dispatch(fetchDagParserTime({
                    dag_id: selectedFlow.flow_key,
                    airflow_env_name: airflowEnvName,
                    bh_env_name: selectedEnvironment.bh_env_name
                }));
            } else {
                console.log("Conditions not met for polling - missing required data");
                console.log("Missing data - flow_name:", selectedFlow?.flow_name, "airflow_env_name:", airflowEnvName, "bh_env_name:", selectedEnvironment?.bh_env_name);
            }
        }, 5000); // Poll every 5 seconds
        
        console.log("Polling interval set up with ID:", pollingIntervalRef.current);
    };

    const handleClick = async () => {
        setIsLoading(true);
        try {
            // Initial state: First click should only call deployDag
            if (deploymentState === DeploymentState.INITIAL) {
                console.log("Starting deployment process...", selectedFlow);
                if (!selectedFlow?.flow_definition?.flow_definition_id || !selectedFlow?.flow_deployment?.[0]?.flow_deployment_id) {
                    toast.error("Missing flow definition or deployment ID for deployment.");
                    return;
                }

                try {
                    // First, call deployDag
                    const deployResult = await dispatch(deployDag({
                        flow_definition_id: selectedFlow.flow_definition.flow_definition_id,
                        flow_deployment_id: selectedFlow.flow_deployment[0].flow_deployment_id
                    })).unwrap();
                    
                    console.log("Deploy DAG result:", deployResult);

                    // Immediately fetch dagParserTime once
                    const airflowEnvName = selectedEnvironment?.bh_airflow?.[0]?.airflow_env_name;
                    if (selectedFlow?.flow_name && airflowEnvName && selectedEnvironment?.bh_env_name) {
                        console.log("Fetching dagParserTime immediately...");
                        dispatch(fetchDagParserTime({
                            dag_id: selectedFlow.flow_key,
                            airflow_env_name: airflowEnvName,
                            bh_env_name: selectedEnvironment.bh_env_name
                        }));
                    }

                    toast.success("Initial deployment started. Waiting for deployment to be ready...");
                    setDeploymentState(DeploymentState.DEPLOYING);
                    
                    // Start polling for dagParserTime
                    console.log("Starting polling for dagParserTime...");
                    startPollingDagParserTime();
                } catch (deployError) {
                    console.error("Deploy DAG failed:", deployError);
                    toast.error("Failed to deploy DAG");
                    return;
                }
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
            
            // Clear polling interval on error
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
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
                    icon: <Upload className="h-4 w-4" />,
                    tooltip: "Start Deployment",
                    className: "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                };
            case DeploymentState.DEPLOYING:
                return {
                    icon: <Loader2 className="h-4 w-4 animate-spin" />,
                    tooltip: "Deploying...",
                    className: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                };
            case DeploymentState.READY:
                return {
                    icon: <Play className="h-4 w-4" />,
                    tooltip: "Trigger Flow",
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
                    icon: <Upload className="h-4 w-4" />,
                    tooltip: "Upload Deployment",
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
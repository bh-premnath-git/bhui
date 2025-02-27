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
import { triggerDagDeployment, setDagRunId } from '@/store/slices/designer/flowSlice';
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
                const success = await deployFlow();
                if (success) {
                    togglePlayback();
                }
            } else {
                togglePlayback();
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
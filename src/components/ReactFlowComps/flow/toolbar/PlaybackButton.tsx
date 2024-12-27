import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Pause, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateFlowDefinition, setDagRunId } from '@/redux/FlowSlice';
import { LocalStorageService } from '@/services/localStorageServices';
import { useFlow } from '@/contexts/FlowContext';
import { ApiService } from '@/services/apiServices';

interface PlaybackButtonProps {
  selectedFlowId: string;
  isPlaying: boolean;
  onToggle: () => void;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  selectedData: any;
  flowName: string;
  selectedEnvName: any;
}

export function PlaybackButton({
  selectedFlowId,
  isPlaying,
  onToggle,
  size = 'default',
  className = "",
  selectedData,
  flowName,
  selectedEnvName
}: PlaybackButtonProps) {
  const dispatch = useAppDispatch();
  const location = useLocation(); 
  const { isDirty } = useFlow();
  const { dagParserTime } = useAppSelector((state) => state.flowApi);

  const [prevPathname, setPrevPathname] = useState(location.pathname);

  const abortControllerRef = useRef<AbortController | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    default: "h-10 w-10",
    sm: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const iconSizes = {
    default: "h-4 w-4",
    sm: "h-3 w-3",
    lg: "h-5 w-5"
  };

  const asyncUpdateFlowDef = async () => {
    if (!isPlaying && selectedFlowId) {
      try {
        abortControllerRef.current = new AbortController();

        const flowStructure = LocalStorageService.getItem(`flow-${selectedFlowId}`);
        const flowJson = flowStructure?.nodeFormData?.map((item: any) => item.formData);

        await dispatch(
          updateFlowDefinition({
            flow_id: selectedFlowId,
            flow_json: {
              flow_deployment_id: selectedData?.flow_deployment_id,
              flow_id: selectedFlowId,
              flow_json: { flowJson, flowStructure }
            }
          })
        );
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.log('Flow definition update was aborted due to route change.');
        } else {
          console.error('Error updating flow definition:', error);
        }
      } finally {
        abortControllerRef.current = null;
      }
    }
  };

  const asyncFlowDeploy = async (): Promise<boolean> => {
    try {
      abortControllerRef.current = new AbortController();

      const result = await ApiService(
        '8011',
        'post',
        '/bh_airflow/trigger_dag',
        null,
        { dag_id: flowName, ...selectedEnvName },
        {},
        true,
        abortControllerRef.current.signal
      );

      dispatch(
        setDagRunId({
          dag_run_id: result.dag_run_id,
          dag_id: flowName,
          ...selectedEnvName
        })
      );
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Flow deployment was aborted due to route change.');
      } else {
        console.error('Error deploying flow:', error);
      }
      return false;
    } finally {
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isDirty && selectedFlowId) {
      asyncUpdateFlowDef();
    }
  }, [isDirty, selectedFlowId]);


  useEffect(() => {
    if (location.pathname !== prevPathname && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPrevPathname(location.pathname);
  }, [location.pathname, prevPathname]);


  const handleClick = async () => {
    setIsLoading(true);
    if (!isPlaying) {
      const success = await asyncFlowDeploy();
      if (success) {
        onToggle();
      }
    } else {
      onToggle();
    }
    setIsLoading(false);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`${sizeClasses[size]} border border-gray-100 hover:bg-gray-200 rounded-md ${className}`}
            onClick={handleClick}
            aria-label={isPlaying ? "Deployment Started" : "Deployment Stopped"}
            disabled={!dagParserTime}
          >
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            {isLoading ? (
              <Loader2 className={`${iconSizes[size]} animate-spin`} />
            ) : isPlaying ? (
              <Pause className={iconSizes[size]} />
            ) : (
              <Play className={iconSizes[size]} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          className="bg-gray-900 px-3 py-1.5 text-xs font-medium text-white rounded-md border-0"
          sideOffset={5}
        >
          <p>{isPlaying ? "Deployment Started" : "Deployment Stopped"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import { useEffect, useState } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const { isDirty, fullFlowOptimizzed } = useFlow();
  const hasOptimized = fullFlowOptimizzed()
  const { dagParserTime } = useAppSelector((state) => state.flowApi)
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
      const flowStructure = LocalStorageService.getItem(`flow-${selectedFlowId}`)
      const flowJson = flowStructure?.nodeFormData?.map(item => item.formData);
      dispatch(updateFlowDefinition({ flow_id: selectedFlowId, flow_json: { flow_deployment_id: selectedData?.flow_deployment_id, flow_id: selectedFlowId, flow_json: { flowJson, flowStructure } } }))
    }
  }

  const asyncFlowDeploy = async (): Promise<boolean> => {
    try {
      const result = await ApiService('8011', 'post', '/bh_airflow/trigger_dag', null, { dag_id: flowName, ...selectedEnvName });
      dispatch(setDagRunId({ dag_run_id: result.dag_run_id, dag_id: flowName, ...selectedEnvName }));
      return true;
    } catch (error) {
      console.error('Error deploying flow:', error);
      return false;
    }
  };

  useEffect(() => {
    if (!isDirty && selectedFlowId) {
      asyncUpdateFlowDef();
    }
  }, [isDirty, selectedFlowId]);

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
            aria-label={`${!isPlaying ? "Deployment Stopped" : "Deployment Started"}`}
        
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
          <p>{!isPlaying ? "Deployment Stopped" : "Deployment Started"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
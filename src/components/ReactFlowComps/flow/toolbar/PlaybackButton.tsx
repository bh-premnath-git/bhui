import { useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppDispatch } from '@/redux/hooks';
import { updateFlowDefinition } from '@/redux/FlowSlice';
import { LocalStorageService } from '@/services/localStorageServices';
import { useFlow } from '@/contexts/FlowContext';

interface PlaybackButtonProps {
  selectedFlowId: string;
  isPlaying: boolean;
  onToggle: () => void;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  selectedData: any;
}

export function PlaybackButton({
  selectedFlowId,
  isPlaying,
  onToggle,
  size = 'default',
  className = "",
  selectedData
}: PlaybackButtonProps) {
  const dispatch = useAppDispatch();
  const { isDirty } = useFlow();
  
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

  useEffect(() => {
    if (!isDirty && selectedFlowId) {
      asyncUpdateFlowDef();
    }
  }, [isDirty, selectedFlowId]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`${sizeClasses[size]} border border-gray-100 hover:bg-gray-200 rounded-md ${className}`}
            onClick={() => { onToggle(); }}
            aria-label={`${!isPlaying ? "Deployment Stopped" : "Deployment Started"}`}
          >
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            {!isPlaying ? (
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
import { Play, Pause } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppDispatch } from '@/redux/hooks';
import { updateFlowDefinition } from '@/redux/FlowSlice';
import { LocalStorageService } from '@/services/localStorageServices';

interface PlaybackButtonProps {
  selectedFlowId: string;
  isPlaying: boolean;
  onToggle: () => void;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function PlaybackButton({
  selectedFlowId,
  isPlaying,
  onToggle,
  size = 'default',
  className = ""
}: PlaybackButtonProps) {
  const dispatch = useAppDispatch();

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
      dispatch(updateFlowDefinition({ flow_id: selectedFlowId, flow_json: { flow_json: { flowJson, flowStructure } } }))
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`${sizeClasses[size]} border-1 border-gray-200 hover:bg-gray-100 rounded-full p-2 ${className}`}
            onClick={() => { asyncUpdateFlowDef(); onToggle(); }}
            aria-label={`${isPlaying ? "Pause playback" : "Play playback"}`}
          >
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            {isPlaying ? (
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
          <p>{isPlaying ? "Pause playback" : "Play playback"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
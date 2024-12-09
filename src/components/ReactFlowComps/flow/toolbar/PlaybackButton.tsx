import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useAppDispatch();

  const sizeClasses = {
    default: "h-10 w-10",
    sm: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const iconSizes = {
    default: "h-5 w-5",
    sm: "h-4 w-4",
    lg: "h-6 w-6"
  };

  const expandedWidths = {
    default: "w-32",
    sm: "w-28",
    lg: "w-36"
  };

  const textSizes = {
    default: "text-sm",
    sm: "text-xs",
    lg: "text-base"
  };

  const asnycupdateFlowDef = async () => {
    if (!isPlaying && selectedFlowId) {
      const flowStructure = LocalStorageService.getItem(`flow-${selectedFlowId}`)
      const flowJson = flowStructure?.nodeFormData?.map(item => item.formData);
      dispatch(updateFlowDefinition({ flow_id: selectedFlowId, flow_json: { flow_json: { flowJson, flowStructure } } }))
    }
  }

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          width: isHovered ? expandedWidths[size] : sizeClasses[size].split(' ')[1],
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        className={`${sizeClasses[size].split(' ')[0]} ${className} bg-gray-100 hover:bg-gray-200 rounded-lg overflow-hidden inline-flex items-center justify-center`}
      >
        <Button
          variant="ghost"
          size="icon"
          className={`${sizeClasses[size]} p-0`}
          onClick={() => { asnycupdateFlowDef(); onToggle(); }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label={`${isPlaying ? "Pause playback" : "Play playback"}`}
        >
          <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          <div className="flex items-center justify-center w-full h-full">
            <motion.div
              initial={false}
              animate={{
                width: isHovered ? iconSizes[size].split(' ')[1] : "100%"
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
              className="flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className={iconSizes[size]} />
              ) : (
                <Play className={iconSizes[size]} />
              )}
            </motion.div>
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: isHovered ? "auto" : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
              style={{
                overflow: 'hidden',
                flexShrink: isHovered ? 0 : 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <motion.span
                className={`ml-1 whitespace-nowrap ${textSizes[size]}`}
                initial={{ scale: 0 }}
                animate={{
                  scale: isHovered ? 1 : 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              >
                {isPlaying ? "Pause" : "Play"}
              </motion.span>
            </motion.div>
          </div>
        </Button>
      </motion.div>
    </>
  );
}
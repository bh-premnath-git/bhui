import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DescriptionCellProps {
  value: string | undefined;
  fieldId: string | number;
}

export interface DescriptionCellRef {
  updateDescription: (description: string) => Promise<void>;
  setGenerating: (isGenerating: boolean) => void;
}

export const DescriptionCell = forwardRef<DescriptionCellRef, DescriptionCellProps>(
  function DescriptionCell({ value: initialValue, fieldId }, ref) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedValue, setGeneratedValue] = useState<string | undefined>();

    const updateDescription = useCallback(async (description: string) => {
      // Update the description directly
      setGeneratedValue(description);
      return Promise.resolve();
    }, []);

    const setGeneratingState = useCallback((generating: boolean) => {
      setIsGenerating(generating);
    }, []);

    useImperativeHandle(ref, () => ({
      updateDescription,
      setGenerating: setGeneratingState
    }), [updateDescription, setGeneratingState]);

    if (isGenerating) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="animate-spin">⏳</span>
          <span>Generating description...</span>
        </div>
      );
    }

    const displayValue = generatedValue || initialValue;

    if (!displayValue) {
      return (
        <div className="flex items-center text-muted-foreground gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>No description available</span>
        </div>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[300px] truncate">
              {displayValue}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[400px] whitespace-pre-wrap">{displayValue}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

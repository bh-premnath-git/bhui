import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DescriptionCellProps {
  value: string | undefined;
  fieldId: string | number;
}

export interface DescriptionCellRef {
  generateDescription: () => Promise<void>;
  updateDescription: (description: string) => Promise<void>;
}

export const DescriptionCell = forwardRef<DescriptionCellRef, DescriptionCellProps>(
  function DescriptionCell({ value: initialValue, fieldId }, ref) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedValue, setGeneratedValue] = useState<string | undefined>();

    const generateDescription = useCallback(async () => {
      if (isGenerating) return;
      
      setIsGenerating(true);
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newDescription = `Generated description for field: ${fieldId}. This is a placeholder that should be replaced with AI-generated content.`;
        setGeneratedValue(newDescription);
      } catch (error) {
        toast.error(`Failed to generate description for field ${fieldId}`);
      } finally {
        setIsGenerating(false);
      }
    }, [fieldId, isGenerating]);

    const updateDescription = useCallback(async (description: string) => {
      // Update the description directly without generating
      setGeneratedValue(description);
      return Promise.resolve();
    }, []);

    useImperativeHandle(ref, () => ({
      generateDescription,
      updateDescription
    }), [generateDescription, updateDescription]);

    if (isGenerating) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
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

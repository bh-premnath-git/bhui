import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { AlertCircle, Edit, Check, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    const [isEditing, setIsEditing] = useState(false);
    const [generatedValue, setGeneratedValue] = useState<string | undefined>();
    const [editValue, setEditValue] = useState<string>('');

    const updateDescription = useCallback(async (description: string) => {
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

    const handleStartEdit = () => {
      const currentValue = generatedValue || initialValue || '';
      setEditValue(currentValue);
      setIsEditing(true);
    };

    const handleCancelEdit = () => {
      setIsEditing(false);
      setEditValue('');
    };

    const handleSaveEdit = () => {
      updateDescription(editValue);
      setIsEditing(false);
    };

    if (isGenerating) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="animate-spin">⏳</span>
          <span>Generating description...</span>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="flex flex-col gap-2">
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px] text-sm"
            placeholder="Enter description..."
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="h-8 px-2"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveEdit}
              className="h-8 px-2"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
          </div>
        </div>
      );
    }

    const displayValue = generatedValue || initialValue;

    if (!displayValue) {
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center text-muted-foreground gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>No description available</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartEdit}
            className="h-6 w-6 p-0"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartEdit}
          className="h-6 w-6 p-0"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }
);

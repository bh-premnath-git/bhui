import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { AlertCircle, Edit, Check, X, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DescriptionCellProps {
  value: string | undefined;
  fieldId: string | number;
}

export interface DescriptionCellRef {
  updateDescription: (description: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  getValue: () => string;
}

export const DescriptionCell = forwardRef<DescriptionCellRef, DescriptionCellProps>(
  function DescriptionCell({ value: initialValue, fieldId }, ref) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [generatedValue, setGeneratedValue] = useState<string | undefined>();
    const [editValue, setEditValue] = useState<string>('');

    const updateDescription = useCallback(async (description: string) => {
      setGeneratedValue(description);
      return Promise.resolve();
    }, []);

    const setLoadingState = useCallback((loading: boolean) => {
      setIsLoading(loading);
    }, []);

    const getValue = useCallback(() => {
      const currentValue = generatedValue || initialValue || '';
      return currentValue;
    }, [generatedValue, initialValue]);

    useImperativeHandle(ref, () => ({
      updateDescription,
      setLoading: setLoadingState,
      getValue
    }), [updateDescription, setLoadingState, getValue]);

    const handleStartEdit = () => {
      const currentValue = getValue();
      setEditValue(currentValue);
      setIsEditing(true);
    };

    const handleCancelEdit = () => {
      setIsEditing(false);
      setEditValue('');
    };

    const handleSaveEdit = () => {
      if (editValue.trim() !== '') {
        setGeneratedValue(editValue);
        // In a real application, you would call an API to update the description
        toast.success("Description updated");
      }
      setIsEditing(false);
    };

    if (isLoading) {
      return (
        <div className="flex items-center text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
          Generating description...
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="flex flex-col gap-2">
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px] resize-none"
            placeholder="Enter a description..."
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
    const isEmpty = !displayValue || displayValue.trim() === '';

    if (isEmpty) {
      return (
        <div className="flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-muted-foreground">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  <span className="text-sm">No description available</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click the edit button to add a description</p>
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

    return (
      <div className="group flex justify-between">
        <div className={cn("text-sm leading-relaxed", isEmpty && "text-muted-foreground")}>
          {displayValue}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartEdit}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }
);

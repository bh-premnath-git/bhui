import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { patchPipelineOperation } from '@/store/slices/designer/pipelineSlice';
import { cn } from '@/lib/utils';


export const PipelineNameEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedPipeline } = useAppSelector((state: RootState) => state.pipeline);
  const [isEditing, setIsEditing] = useState(false);
  const [tempPipelineName, setTempPipelineName] = useState(selectedPipeline?.pipeline_name || '');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (selectedPipeline?.pipeline_name) {
      setTempPipelineName(selectedPipeline.pipeline_name);
    }
  }, [selectedPipeline?.pipeline_name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPipelineName(e.target.value);
    setErrorMessage(''); // Clear error when typing
  };

  const handleRename = async () => {
    if (!selectedPipeline) return;
    
    try {
      if (tempPipelineName !== selectedPipeline.pipeline_name) {
        await dispatch(patchPipelineOperation({
          pipelineId: selectedPipeline.pipeline_id, // Make sure this is a number
          data: { 
            pipeline_name: tempPipelineName, 
            pipeline_key: tempPipelineName 
          }
        })).unwrap();
      }
      setIsEditing(false);
    } catch (error) {
      setErrorMessage('Failed to update pipeline name');
      console.error('Error updating pipeline name:', error);
    }
  };

  return (
    <div className="relative flex-grow sm:w-40">
      {isEditing ? (
        <Input
          type="text"
          value={tempPipelineName}
          onChange={handleNameChange}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleRename();
            }
          }}
          disabled={!isEditing}
          className={cn(
            "pr-12 h-9",
            !isEditing && "border-transparent bg-transparent hover:border-input focus:border-input",
            isEditing && "outline-none focus:ring-2 focus:ring-offset-0 focus:ring-black/80 border-gray-300"
        )}
          autoFocus
          aria-label="Edit pipeline name"
        />
      ) : (
        <div className="flex items-center">
          <span className="flex-grow truncate pr-8">{selectedPipeline?.pipeline_name || 'Untitled Pipeline'}</span>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full h-7 w-7 p-1.5"
            onClick={() => setIsEditing(true)}
            aria-label="Edit pipeline name"
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
      {errorMessage && (
        <div className="text-red-500 text-sm mt-1">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
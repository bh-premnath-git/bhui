import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';

interface JsonToPipelineDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JsonToPipelineDialog({ isOpen, onClose }: JsonToPipelineDialogProps) {
  const {makePipeline}=usePipelineContext();
  const [jsonInput, setJsonInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  const handleGeneratePipeline = () => {
    console.log('Generating pipeline from JSON:', jsonInput);
    makePipeline(JSON.parse(jsonInput));
    // Here you would add the actual logic to convert JSON to pipeline
    // For now, we're just logging to the console as requested
    
    // Optionally close the dialog after generating
    // onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Convert JSON to Pipeline</DialogTitle>
          <DialogDescription>
            Paste your JSON data below to convert it into a pipeline.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Paste your JSON here..."
            className="min-h-[200px]"
            value={jsonInput}
            onChange={handleInputChange}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGeneratePipeline}>
            Generate Pipeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
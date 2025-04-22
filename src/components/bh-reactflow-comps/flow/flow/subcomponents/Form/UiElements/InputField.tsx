import React, { useState, useEffect } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { usePipeline } from '@/hooks/usePipeline';

interface InputFieldProps {
  label: string;
  id: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  spanCol?: number;
  mandatory: boolean;
  error?: string;
  type?: string;
  default?: any;
  description: string;
  formData?: Record<string, any>;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  value,
  placeholder,
  onChange,
  mandatory,
  error,
  description,
  default: defaultValue,
  type = 'text',
  formData = {}
}) => {
  const [touched, setTouched] = useState(false);
  const [fieldError, setFieldError] = useState(error);
  const [currentPipelineId, setCurrentPipelineId] = useState<string | null>(null);
  
  // This function searches through the form data to find pipeline name fields
  const findPipelineName = () => {
    // Look for common pipeline field patterns
    for (const key in formData) {
      // If a field has "pipeline" in it and it's a dropdown (string value)
      if (
        (key.toLowerCase().includes('pipeline') || key.toLowerCase() === 'pipeline') && 
        typeof formData[key] === 'string' && 
        formData[key] !== ''
      ) {
        return formData[key];
      }
    }
    return null;
  };
  
  const pipelineName = findPipelineName();
  const { pipelineDetails } = usePipeline(pipelineName);
  
  // On mount and when pipelineDetails changes, update the current pipeline ID
  useEffect(() => {
    if (pipelineDetails && pipelineDetails.pipeline_id) {
      // Only update if it's different than what we had before
      const newPipelineId = pipelineDetails.pipeline_id.toString();
      if (newPipelineId !== currentPipelineId) {
        setCurrentPipelineId(newPipelineId);
      }
    }
  }, [pipelineDetails]);
  
  // When the pipeline ID changes and this is a pipeline ID field, update the value
  useEffect(() => {
    if (label === "Pipeline id" && currentPipelineId && (!value || value !== currentPipelineId)) {
      const syntheticEvent = {
        target: {
          value: currentPipelineId
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(syntheticEvent);
    }
  }, [label, currentPipelineId, value, onChange]);

  const handleBlur = () => {
    setTouched(true);
    if (mandatory && !value.trim() && !defaultValue?.toString().trim() && !currentPipelineId) {
      setFieldError(`${label} is required`);
    } else {
      setFieldError(error);
    }
  };

  // Determine which value to display - prioritize the form value, then pipeline ID, then default
  let displayValue = value || defaultValue || "";
  if (label === "Pipeline id" && currentPipelineId && !value) {
    displayValue = currentPipelineId;
  }

  const displayError = touched ? fieldError : error;

  // For debugging - log when pipeline details change for Pipeline id fields
  useEffect(() => {
    if (label === "Pipeline id") {
      console.log("Pipeline ID field values:", {
        pipelineName,
        pipelineId: pipelineDetails?.pipeline_id,
        currentValue: value,
        displayValue
      });
    }
  }, [label, pipelineName, pipelineDetails, value, displayValue]);

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex items-center space-x-1">
        <label
          htmlFor={id}
          className="text-sm text-gray-600"
        >
          {label} {mandatory && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-2 bg-white text-gray-700 border border-gray-200 rounded shadow-sm">
                {description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <input
        type={type}
        id={id}
        name={label}
        value={displayValue}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={handleBlur}
        className={`w-full border px-3 py-2 text-sm bg-white rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500
          ${displayError ? 'border-red-500' : 'border-gray-300'}`}
      />
      {displayError && (
        <p className="text-red-500 text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {displayError}
        </p>
      )}
    </div>
  );
};

export default InputField;

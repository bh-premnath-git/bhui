import React, { useCallback, useEffect } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePipeline } from '@/hooks/usePipeline';
import { useFlow } from '@/context/designers/FlowContext';

interface DropdownFieldProps {
    id: string;
    property_key: string;
    property_name: string;
    mandatory: boolean;
    options: string[];
    isLoading?: boolean;
    value: string;
    onChange: (key: string, value: string) => void;
    label?: string;
    error?: string;
    default?: string; // For example: "options[0].value"
    description: string;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
    property_key,
    property_name,
    options,
    isLoading,
    value,
    onChange,
    label,
    mandatory,
    description,
    default: defaultValue,
    error
}) => {
    const { flowPipeline } = useFlow();
    const isPipelineField = property_key.includes('pipeline');

    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        console.log(selectedValue)
        // Special handling for pipeline selection to include pipeline_id
        if (isPipelineField && flowPipeline && Array.isArray(flowPipeline)) {
            const selectedPipeline = flowPipeline.find((p: any) => p.pipeline_name === selectedValue || p.pipeline_key === selectedValue);
            console.log(selectedPipeline)
            if (selectedPipeline && selectedPipeline.pipeline_id) {
                // Store both name and ID in JSON format
                const pipelineData = JSON.stringify({
                    name: selectedValue,
                    id: selectedPipeline.pipeline_id,
                    pipeline_key: selectedPipeline.pipeline_key
                });
                onChange(property_key, pipelineData);
                return;
            }
        }
        
        // Default behavior for non-pipeline fields
        onChange(property_key, selectedValue);
    }, [onChange, property_key, isPipelineField, flowPipeline]);

    // Only auto-select for non-node type dropdowns
    // This prevents auto-selection for the main node type dropdown while
    // preserving it for other form fields that may need default values
    const isNodeTypeDropdown = property_key === 'type' || property_name === 'Select Node Type';
    
    useEffect(() => {
        // Skip auto-selection for node type dropdown
        if (isNodeTypeDropdown) return;
        
        if (!value && options.length > 0) {
            let chosenOption = options[0]; 

            if (defaultValue) {
                // Extract index from a string like "options[0].value"
                const match = defaultValue.match(/options\[(\d+)\]\.value/);
                if (match && match[1]) {
                    const idx = parseInt(match[1], 10);
                    if (!isNaN(idx) && idx >= 0 && idx < options.length) {
                        chosenOption = options[idx];
                    }
                }
            }

            // For pipeline fields, handle the same way as manual selection
            if (isPipelineField && flowPipeline && Array.isArray(flowPipeline)) {
                const selectedPipeline = flowPipeline.find((p: any) => p.pipeline_name === chosenOption || p.pipeline_key === chosenOption);
                
                if (selectedPipeline && selectedPipeline.pipeline_id) {
                    const pipelineData = JSON.stringify({
                        name: chosenOption,
                        id: selectedPipeline.pipeline_id
                    });
                    onChange(property_key, pipelineData);
                    return;
                }
            }

            onChange(property_key, chosenOption);
        }
    }, [value, defaultValue, options, onChange, property_key, isNodeTypeDropdown, isPipelineField, flowPipeline]);
    
    // Always load pipeline data for pipeline fields, regardless of selection
    usePipeline(isPipelineField ? (value || 'load_pipeline_data') : null);

    // For display in the dropdown, extract the name if value is a JSON string
    const displayValue = React.useMemo(() => {
        if (isPipelineField && value) {
            try {
                const parsedValue = JSON.parse(value);

                console.log(parsedValue)
                if (parsedValue && parsedValue.name) {
                    return parsedValue.name;
                }
            } catch (e) {
                // If not valid JSON, use the value as is
                return value;
            }
        }
        return value;
    }, [value, isPipelineField]);

    return (
        <div className="w-full max-w-sm space-y-4">
            {label && (
                <div className="flex items-center space-x-1">
                    <label
                        htmlFor={property_key}
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
            )}
            <select
                id={property_key}
                name={property_key}
                value={displayValue}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full border px-3 py-2 text-sm bg-white rounded-md
                    focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500
                    ${error ? 'border-red-500' : 'border-gray-300'}
                    ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
                <option value="">{isLoading ? "Loading..." : `Select ${property_name}`}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
};

export default DropdownField;

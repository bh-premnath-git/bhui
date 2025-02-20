import React, { useCallback, useEffect } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(property_key, e.target.value);
    }, [onChange, property_key]);

    useEffect(() => {
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

            onChange(property_key, chosenOption);
        }
    }, [value, defaultValue, options, onChange, property_key]);

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
                value={value}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full border px-3 py-2 text-sm bg-white rounded-md
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
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

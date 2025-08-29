import React, { useEffect } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnumDropdownProps {
    id: string;
    property_key: string;
    property_name: string;
    value: string;
    onChange: (key: string, value: string) => void;
    enumValues: string[];
    mandatory: boolean;
    label?: string;
    error?: string;
    default?: string;
    description: string;
}

export const EnumDropdown: React.FC<EnumDropdownProps> = React.memo(({
    property_key,
    property_name,
    value,
    onChange,
    enumValues,
    label,
    mandatory,
    description,
    default: defaultValue,
    error
}) => {
    
    useEffect(() => {
        if (!value && defaultValue && enumValues.includes(defaultValue)) {
            onChange(property_key, defaultValue);
        }
    }, [value, defaultValue, enumValues, onChange, property_key]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(property_key, e.target.value);
    };

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
                className={`w-full border px-3 py-2 text-sm bg-white rounded-md
                    focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 focus:border-blue-500
                    ${error ? 'border-red-500' : 'border-gray-300'}`}
            >
                <option value="">{`Select ${property_name}`}</option>
                {enumValues.map((option) => (
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
});

EnumDropdown.displayName = 'EnumDropdown';

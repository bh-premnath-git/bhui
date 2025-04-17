import React, { useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CheckboxFieldProps {
    id: string;
    property_key: string;
    property_name: string;
    value: string;
    onChange: (key: string, value: string) => void;
    label?: string;
    error?: string;
    mandatory: boolean;
    default?: boolean; // boolean default value
    description: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
    property_key,
    property_name,
    value,
    onChange,
    label,
    error,
    description,
    default: defaultValue,
    mandatory
}) => {
    // If value is empty and defaultValue is a boolean, set the checkbox state accordingly
    useEffect(() => {
        if (!value && typeof defaultValue === 'boolean') {
            onChange(property_key, defaultValue.toString());
        }
    }, [value, defaultValue, onChange, property_key]);

    const handleCheckedChange = (checked: boolean) => {
        onChange(property_key, checked ? 'true' : 'false');
    };

    return (
        <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={property_key}
                    checked={value === "true"}
                    onCheckedChange={handleCheckedChange}
                    className={`border 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500
                        ${error ? 'border-red-500' : 'border-gray-300'}`}
                />
                {label ? (
                    <div className="flex items-center space-x-1">
                        <Label
                            htmlFor={property_key}
                            className="text-sm text-gray-600 cursor-pointer"
                        >
                            {label} {mandatory && <span className="text-red-500">*</span>}
                        </Label>
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
                ) : (
                    <div className="flex items-center space-x-1">
                        <Label
                            htmlFor={property_key}
                            className="text-sm text-gray-600 cursor-pointer"
                        >
                            {property_name} {mandatory && <span className="text-red-500">*</span>}
                        </Label>
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
            </div>
            {error && (
                <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
};

export default CheckboxField;

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox"; // Adjust the import based on your project structure
import { Label } from "@/components/ui/label";       // Adjust the import based on your project structure
import { AlertCircle } from 'lucide-react';

interface CheckboxFieldProps {
    id:string;
    property_key: string;
    property_name: string;
    value: string;
    onChange: (key: string, value: string) => void;
    label?: string;
    error?: string;
    mandatory: boolean;

}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
    property_key,
    property_name,
    value,
    onChange,
    label,
    error,
    mandatory
}) => {
    const handleCheckedChange = (checked: boolean) => {
        onChange(property_key, checked ? 'true' : 'false');
    };

    return (
        <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors">
            <div className="flex items-center space-x-2">
                <Checkbox 
                    id={property_key}
                    checked={value === 'true'}
                    onCheckedChange={handleCheckedChange}
                    className={`rounded border-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500
                        ${error ? 'border-red-500' : 'border-gray-300'}`}
                />
                {label ? (
                    <Label 
                        htmlFor={property_key}
                        className={`text-sm font-normal leading-none cursor-pointer
                            ${error ? 'text-red-600' : 'text-gray-700'}`}
                    >
                        {label} {mandatory && <span className="text-red-500">*</span>}
                    </Label>
                ) : (
                    <Label 
                        htmlFor={property_key}
                        className={`text-sm font-normal leading-none cursor-pointer
                            ${error ? 'text-red-600' : 'text-gray-700'}`}
                    >
                        {property_name} {mandatory && <span className="text-red-500">*</span>}
                    </Label>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
};
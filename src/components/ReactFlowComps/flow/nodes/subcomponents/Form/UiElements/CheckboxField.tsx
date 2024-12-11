import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';

interface CheckboxFieldProps {
    id: string;
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

    console.log(">>>", value);


    return (
        <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={property_key}
                    checked={value === "true"}
                    onCheckedChange={handleCheckedChange}
                    className={`border 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${error ? 'border-red-500' : 'border-gray-300'}`}
                />
                {label ? (
                    <Label
                        htmlFor={property_key}
                        className="text-sm text-gray-600 cursor-pointer"
                    >
                        {label} {mandatory && <span className="text-red-500">*</span>}
                    </Label>
                ) : (
                    <Label
                        htmlFor={property_key}
                        className="text-sm text-gray-600 cursor-pointer"
                    >
                        {property_name} {mandatory && <span className="text-red-500">*</span>}
                    </Label>
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
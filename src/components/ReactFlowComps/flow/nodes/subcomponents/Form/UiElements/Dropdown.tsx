import React, { useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

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
    default?:any;
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
    error
}) => {
    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(property_key, e.target.value);
    }, [onChange, property_key]);

    return (
        <div className="w-full max-w-sm space-y-4">
            {label && (
                <label 
                    htmlFor={property_key} 
                    className="text-sm text-gray-600"
                >
                    {label} {mandatory && <span className="text-red-500">*</span>}
                </label>
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
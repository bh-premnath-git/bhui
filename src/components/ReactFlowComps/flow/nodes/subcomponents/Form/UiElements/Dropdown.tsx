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
        console.log('Dropdown changed:', property_key, e.target.value);
        debugger
        onChange(property_key, e.target.value);
    }, [onChange, property_key]);

    return (
        <div className="p-2  border-gray-200  hover:border-stale-500 transition-colors">
            {label && (
                <label htmlFor={property_key} className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {mandatory && <span className="text-red-500">*</span>}
                </label>
            )}
            <select
                id={property_key}
                name={property_key}
                value={value}
                onChange={handleChange}
                disabled={isLoading}
                className={`block w-full rounded-md border-2 shadow-sm focus:border-stale-500 focus:ring-indigo-500 sm:text-sm
                    ${error ? 'border-red-500' : 'border-gray-300'}`}
            >
                <option value="">{isLoading ? "Loading..." : `Select ${property_name}`}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
};
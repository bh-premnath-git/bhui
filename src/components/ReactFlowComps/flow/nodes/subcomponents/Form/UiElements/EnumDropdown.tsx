import React from 'react';
import { AlertCircle } from 'lucide-react';

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
}

export const EnumDropdown: React.FC<EnumDropdownProps> = React.memo(({
    property_key,
    property_name,
    value,
    onChange,
    enumValues,
    label,
    mandatory,
    error
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(property_key, e.target.value);
    };

    return (
        <div className="p-2 border-gray-200 hover:border-stale-500 transition-colors">
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
                className={`block w-full rounded-md border-2 shadow-sm focus:border-stale-500 focus:ring-stale-500 sm:text-sm
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
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
});

EnumDropdown.displayName = 'EnumDropdown';

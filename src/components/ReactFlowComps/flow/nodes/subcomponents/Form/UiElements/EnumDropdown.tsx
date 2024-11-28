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
                className={`w-full border px-3 py-2 text-sm bg-white rounded-md
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
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
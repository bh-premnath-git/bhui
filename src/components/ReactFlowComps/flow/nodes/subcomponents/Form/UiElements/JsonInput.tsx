import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface JsonInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  spanCol?: number;
  mandatory: boolean;
  default?:any;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const JsonInput: React.FC<JsonInputProps> = ({
  label,
  placeholder,
  mandatory,
  id,
  value,
  onChange
}) => {
  const [jsonError, setJsonError] = useState<string>('');
  const [isValid, setIsValid] = useState(false);

  const validateAndFormatJSON = (input: string) => {
    if (!input.trim()) {
      setJsonError('');
      setIsValid(false);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonError('');
      setIsValid(true);
      if (formatted !== input) {
        const syntheticEvent = {
          target: {
            value: formatted
          }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      }
    } catch (error) {
      setJsonError('Invalid JSON format');
      setIsValid(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      validateAndFormatJSON(value);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [value]);

  const getBorderColor = () => {
    if (!value) return 'border-gray-300';
    if (isValid) return 'border-green-500';
    if (jsonError) return 'border-red-500';
    return 'border-gray-300';
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <label 
        htmlFor={id} 
        className="text-sm text-gray-600"
      >
        {label} {mandatory && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={4}
        className={`w-full border px-3 py-2 text-sm bg-white rounded-md font-sans
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${getBorderColor()}`}
        placeholder={placeholder}
      />
      {jsonError && (
        <p className="text-red-500 text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {jsonError}
        </p>
      )}
    </div>
  );
};
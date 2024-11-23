import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface JsonInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  spanCol?: number;
  mandatory: boolean;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const JsonInput: React.FC<JsonInputProps> = ({label, placeholder, mandatory, id, value, onChange }) => {
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
        // Create a synthetic event
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
    <div className="p-2  ">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {mandatory && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={4}
        className={`mt-1 block w-full rounded-lg border-2 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:text-sm font-mono transition-colors duration-200 ${getBorderColor()}`}
        placeholder={placeholder}
      />
      {jsonError && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {jsonError}
        </p>
      )}
    </div>
  );
};
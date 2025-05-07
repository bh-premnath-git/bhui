import React, { useState, useEffect } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface JsonInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  spanCol?: number;
  mandatory: boolean;
  default?: any;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  description: string;
}

export const JsonInput: React.FC<JsonInputProps> = ({
  label,
  placeholder,
  mandatory,
  id,
  value,
  description,
  default: defaultValue,
  onChange
}) => {
  const [jsonError, setJsonError] = useState<string>('');
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Use displayValue to either show value or defaultValue as a fallback
  const displayValue = value || defaultValue || "";

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

      // If the formatted version differs, update via onChange
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
      validateAndFormatJSON(displayValue);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [displayValue]);

  const getBorderColor = () => {
    if (!displayValue) return 'border-gray-300';
    if (isValid) return 'border-green-500';
    if (jsonError) return 'border-red-500';
    return 'border-gray-300';
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex items-center space-x-1">
        <label
          htmlFor={id}
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
      <textarea
        id={id}
        value={displayValue}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        rows={isFocused ? 4 : 1}
        className={`w-full border px-3 py-2 text-sm bg-white rounded-md font-sans
          transition-all duration-200 ease-in-out
          resize-none overflow-hidden
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500
          ${getBorderColor()}`}
        placeholder={placeholder}
        style={{
          height: isFocused ? 'auto' : '38px',
          minHeight: isFocused ? '96px' : '38px'
        }}
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

export default JsonInput;

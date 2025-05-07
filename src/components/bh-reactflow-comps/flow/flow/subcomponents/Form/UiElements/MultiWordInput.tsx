import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MultiWordInputProps {
  id: string;
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  mandatory: boolean;
  default?: string[]; // Assuming default is an array of strings
  description: string;
}

export const MultiWordInput: React.FC<MultiWordInputProps> = ({
  id,
  label,
  values,
  onChange,
  placeholder = "Type and press Enter or comma to add",
  description,
  default: defaultValue,
  mandatory
}) => {
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  // If no values are selected and a defaultValue is provided, set them
  useEffect(() => {
    if (values.length === 0 && defaultValue && Array.isArray(defaultValue) && defaultValue.length > 0) {
      onChange(defaultValue);
    }
  }, [values, defaultValue, onChange]);

  useEffect(() => {
    if (containerRef.current && inputRef.current) {
      if (values.length > 0 && inputValue === '') {
        containerRef.current.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
    }
  }, [values, inputValue]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        onChange([...values, inputValue.trim()]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(values.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      {label && (
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
      )}
      <div
        ref={containerRef}
        className={cn(
          "flex items-center h-10 min-h-[40px] max-h-[40px]",
          "px-3 py-2 border border-gray-300 rounded-md",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500",
          "overflow-x-auto overflow-y-hidden",
          "whitespace-nowrap",
          "scroll-smooth",
          "[&::-webkit-scrollbar]:h-1",
          "scrollbar-track-transparent",
          "scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex items-center gap-2 h-full flex-nowrap">
          {values.map((word, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex-shrink-0 items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800"
            >
              {word}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="ml-1 flex items-center justify-center p-0.5 rounded-full hover:bg-blue-200 focus:outline-none"
                aria-label={`Remove ${word}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-shrink-0 min-w-[120px] bg-transparent outline-none text-sm text-gray-600"
            placeholder={values.length === 0 ? placeholder : ""}
            aria-label="Enter a word"
          />
        </div>
      </div>
    </div>
  );
};

export default MultiWordInput;

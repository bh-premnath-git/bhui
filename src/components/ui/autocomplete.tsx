import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';

interface AutocompleteProps {
  options: string[];
  value: any;
  onChange: (newValue: string) => void;
  renderInput: (params: any) => React.ReactElement;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  value,
  onChange,
  renderInput,
  placeholder,
  className,
  required
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = options.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={className}
        required={required}
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => {
                onChange(suggestion);
                setIsOpen(false);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from './input';

interface AutocompleteProps {
  options: string[];
  value: any;
  onChange: (newValue: string) => void;
  renderInput?: (params: any) => React.ReactElement;
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
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input value
  useEffect(() => {
    const filtered = options.filter(suggestion =>
      suggestion.toLowerCase().includes((value || '').toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [value, options]);

  // Update dropdown position when it opens
  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const suggestionElements = document.querySelectorAll('.autocomplete-suggestion');
      if (suggestionElements.length > 0) {
        (suggestionElements[0] as HTMLElement).focus();
      }
    }
  };

  // Render dropdown using portal to avoid clipping issues
  const renderDropdown = () => {
    if (!isOpen || filteredSuggestions.length === 0) return null;

    return createPortal(
      <div 
        className="autocomplete-dropdown fixed shadow-lg rounded-md border border-gray-200 bg-white overflow-hidden"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
          zIndex: 9999,
          maxHeight: '200px',
          overflowY: 'auto'
        }}
      >
        <ul className="py-1">
          {filteredSuggestions.map((suggestion, index) => (
            <li 
              key={index}
              tabIndex={0}
              className="autocomplete-suggestion px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none cursor-pointer text-sm"
              onClick={() => {
                onChange(suggestion);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onChange(suggestion);
                  setIsOpen(false);
                  inputRef.current?.focus();
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const next = e.currentTarget.nextElementSibling as HTMLElement;
                  if (next) next.focus();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prev = e.currentTarget.previousElementSibling as HTMLElement;
                  if (prev) prev.focus();
                  else inputRef.current?.focus();
                }
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      </div>,
      document.body
    );
  };

  return (
    <div ref={wrapperRef} className="relative autocomplete-wrapper">
      {renderInput ? (
        renderInput({
          ref: inputRef,
          value,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
            setIsOpen(true);
          },
          onFocus: () => setIsOpen(true),
          onKeyDown: handleKeyDown,
          placeholder,
          className,
          required
        })
      ) : (
        <Input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
          required={required}
        />
      )}
      {renderDropdown()}
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from './input';
import './autocomplete.css';

interface AutocompleteProps {
  options: string[];
  value: any;
  onChange: (newValue: string) => void;
  renderInput?: (params: any) => React.ReactElement;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  value,
  onChange,
  renderInput,
  placeholder,
  className,
  required,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debug logging
  console.log(' Autocomplete render:', {
    options: options.length,
    value,
    placeholder,
    className,
    filteredSuggestions: filteredSuggestions.length,
    isOpen
  });

  // Filter suggestions based on input value
  useEffect(() => {
    const filtered = options.filter(suggestion =>
      suggestion.toLowerCase().includes((value || '').toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [value, options]);

  // Update dropdown position when it opens
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        
        // Calculate position relative to the viewport for fixed positioning
        let top = rect.bottom;
        let left = rect.left;
        
        // Check if dropdown would go outside the viewport
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dropdownHeight = Math.min(200, filteredSuggestions.length * 40); // Estimate height
        
        // If dropdown would go below viewport, show it above the input
        if (top + dropdownHeight > viewportHeight) {
          top = rect.top - dropdownHeight;
        }
        
        // If dropdown would go outside right side of viewport, adjust left position
        if (left + rect.width > viewportWidth) {
          left = viewportWidth - rect.width;
        }
        
        // Make sure left is not negative
        left = Math.max(0, left);
        
        const finalPosition = {
          top: Math.max(0, top),
          left,
          width: rect.width
        };
        
        console.log('Input rect:', rect);
        console.log('Final position:', finalPosition);
        
        setPosition(finalPosition);
      }
    };

    updatePosition();

    // Update position on scroll and resize
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking on the wrapper or dropdown elements
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        // Check if the click is on a dropdown element
        const isDropdownClick = target.closest('.autocomplete-dropdown') || 
                               target.closest('.autocomplete-suggestion');
        
        if (!isDropdownClick) {
          setIsOpen(false);
        }
      }
    };

    // Use mouseup instead of mousedown to ensure click events are processed first
    document.addEventListener('mouseup', handleClickOutside);
    return () => document.removeEventListener('mouseup', handleClickOutside);
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
          zIndex: 999999,
          maxHeight: '200px',
          overflowY: 'auto',
          position: 'fixed',
          pointerEvents: 'auto'
        }}
      >
        <ul className="py-1">
          {filteredSuggestions.map((suggestion, index) => (
            <li 
              key={index}
              tabIndex={0}
              className="autocomplete-suggestion px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none cursor-pointer text-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                onChange(suggestion);
                setIsOpen(false);
                // Add a small delay to ensure the value is set before focusing
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();

                  onChange(suggestion);
                  setIsOpen(false);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
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
        React.cloneElement(renderInput({
          value,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!disabled) {
              onChange(e.target.value);
              setIsOpen(true);
            }
          },
          onFocus: () => !disabled && setIsOpen(true),
          onKeyDown: handleKeyDown,
          placeholder,
          className,
          required,
          disabled
        }), { ref: inputRef })
      ) : (
        <Input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={(e) => {
            if (!disabled) {
              onChange(e.target.value);
              setIsOpen(true);
            }
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
          required={required}
          disabled={disabled}
        />
      )}
      {renderDropdown()}
    </div>
  );
};
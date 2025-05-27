import React from 'react';
import { Input } from '@/components/ui/input';
import { FieldProps } from './types';

export const FormField: React.FC<FieldProps> = ({ 
  operator, 
  field, 
  value, 
  hasError, 
  fieldInfo, 
  onChange 
}) => {
  const uiProps = fieldInfo.uiProperties || {};
  // Format the field label to be more business-friendly
  let fieldLabel = uiProps.propertyName || field;
  // Convert snake_case to Title Case
  fieldLabel = fieldLabel.replace(/_/g, ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  const uiType = uiProps.uiType || '';

  // Map ui_type to appropriate form controls
  if (uiType === 'json' || uiType === 'list[string]' || fieldInfo.type.startsWith('array:')) {
    return (
      <Input
        id={`${operator}-${field}`}
        value={value}
        onChange={(e) => onChange(operator, field, e.target.value)}
        placeholder={`Enter ${fieldLabel}${fieldInfo.required ? ' *' : ''}`}
        className={`h-8 text-sm ${hasError ? 'border-red-500' : ''}`}
        aria-required={fieldInfo.required}
      />
    );
  }

  switch (uiType) {
    case 'dropdown':
    case 'enum':
      // For dropdown/enum we would ideally fetch options if endpoint is provided
      return (
        <select
          id={`${operator}-${field}`}
          value={value}
          onChange={(e) => onChange(operator, field, e.target.value)}
          className={`w-full p-2 border rounded-md h-8 text-sm ${hasError ? 'border-red-500' : ''}`}
          aria-required={fieldInfo.required}
        >
          <option value="">{`Select ${fieldLabel}${fieldInfo.required ? ' *' : ''}`}</option>
          {fieldInfo.type === 'boolean' ? (
            <>
              <option value="true">True</option>
              <option value="false">False</option>
            </>
          ) : null}
        </select>
      );
    case 'checkbox':
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`${operator}-${field}`}
            checked={value === 'true'}
            onChange={(e) => onChange(operator, field, e.target.checked ? 'true' : 'false')}
            className={`form-checkbox h-4 w-4 ${hasError ? 'border-red-500' : ''}`}
            aria-required={fieldInfo.required}
          />
          <label htmlFor={`${operator}-${field}`} className="ml-2 text-xs">
            {fieldLabel}
          </label>
        </div>
      );
    case 'number':
      return (
        <Input
          id={`${operator}-${field}`}
          type="number"
          value={value}
          onChange={(e) => onChange(operator, field, e.target.value)}
          placeholder={`Enter ${fieldLabel}${fieldInfo.required ? ' *' : ''}`}
          className={`h-8 text-sm ${hasError ? 'border-red-500' : ''}`}
          aria-required={fieldInfo.required}
        />
      );
    default:
      return (
        <Input
          id={`${operator}-${field}`}
          value={value}
          onChange={(e) => onChange(operator, field, e.target.value)}
          placeholder={`Enter ${fieldLabel}${fieldInfo.required ? ' *' : ''}`}
          className={`h-8 text-sm ${hasError ? 'border-red-500' : ''}`}
          aria-required={fieldInfo.required}
        />
      );
  }
};

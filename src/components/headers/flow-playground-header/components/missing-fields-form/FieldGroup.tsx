import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FieldGroupProps } from './types';
import { useAppSelector } from '@/hooks/useRedux';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { parseFieldValue } from './utils';

export const FieldGroup: React.FC<FieldGroupProps> = ({ 
  operator,
  groupKey,
  fields,
  formValues,
  formErrors,
  fieldTypeMapping,
  onChange
}) => {
  const selectedEnvironment = useAppSelector(state => state.flow.selectedEnvironment);

  const renderField = (field: string) => {
    const fieldInfo = fieldTypeMapping[operator]?.[field];
    const rawValue = formValues[operator]?.[field] || '';
    const hasError = formErrors[operator]?.[field] || false;
    const isRequired = fieldInfo?.required;
    const uiProperties = fieldInfo?.uiProperties;
    const fieldType = fieldInfo?.type || 'string';

    // Parse value if it's a JSON string
    const parsedValue = parseFieldValue(rawValue);
    const isJsonValue = typeof parsedValue !== 'string' && 
                        (Array.isArray(parsedValue) || typeof parsedValue === 'object');

    // Get dynamic options if endpoint is provided
    const { options = [], isLoading } = useDropdownOptions(
      uiProperties?.endpoint,
      `${selectedEnvironment?.bh_env_id}`
    );

    // Determine final options: either from endpoint or static enum values
    const fieldOptions = options.length > 0 ? options : (uiProperties?.selectOptions || []);

    const renderArrayInput = () => {
      const arrayValue = Array.isArray(parsedValue) ? parsedValue : [];
      
      return (
        <div className="space-y-2">
          <Textarea
            value={rawValue}
            onChange={(e) => onChange(operator, field, e.target.value)}
            className={`${hasError ? 'border-red-500' : ''} font-mono text-xs`}
            placeholder="Enter JSON array"
          />
          {Array.isArray(parsedValue) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {parsedValue.map((item, index) => (
                <Badge key={index} variant="outline">
                  {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      );
    };

    const renderObjectInput = () => {
      return (
        <Textarea
          value={rawValue}
          onChange={(e) => onChange(operator, field, e.target.value)}
          className={`${hasError ? 'border-red-500' : ''} font-mono text-xs`}
          placeholder="Enter JSON object"
        />
      );
    };

    const renderInput = () => {
      // Check if the field contains JSON data (array or object)
      if (isJsonValue) {
        if (Array.isArray(parsedValue)) {
          return renderArrayInput();
        } else {
          return renderObjectInput();
        }
      }

      // Handle select fields with options
      if (fieldOptions.length > 0) {
        return (
          <Select
            value={rawValue}
            onValueChange={(newValue) => onChange(operator, field, newValue)}
            disabled={isLoading}
          >
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder={isLoading ? 'Loading options...' : 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {fieldOptions.map((option: string | number) => (
                <SelectItem key={String(option)} value={String(option)}>
                  {String(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      // For multiline text or large text fields
      if (fieldType.includes('text') || (uiProperties?.uiType === 'textarea')) {
        return (
          <Textarea
            value={rawValue}
            onChange={(e) => onChange(operator, field, e.target.value)}
            className={hasError ? 'border-red-500' : ''}
          />
        );
      }

      // Default to simple input
      return (
        <Input
          type="text"
          value={rawValue}
          onChange={(e) => onChange(operator, field, e.target.value)}
          className={hasError ? 'border-red-500' : ''}
        />
      );
    };

    return (
      <div key={field} className="space-y-2">
        <Label className="text-sm text-gray-600">
          {field}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {renderInput()}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {groupKey !== 'default' && (
        <h3 className="text-sm font-medium text-gray-500">{groupKey}</h3>
      )}
      <div className="grid grid-cols-2 gap-4">
        {fields.map(renderField)}
      </div>
    </div>
  );
};

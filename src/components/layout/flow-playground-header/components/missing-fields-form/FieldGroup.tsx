import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldGroupProps } from './types';
import { useAppSelector } from '@/hooks/useRedux';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

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
    const value = formValues[operator]?.[field] || '';
    const hasError = formErrors[operator]?.[field] || false;
    const isRequired = fieldInfo?.required;
    const uiProperties = fieldInfo?.uiProperties;

    // Get dynamic options if endpoint is provided
    const { options = [], isLoading } = useDropdownOptions(
      uiProperties?.endpoint,
      `${selectedEnvironment?.bh_env_id}`
    );

    // Determine final options: either from endpoint or static enum values
    const fieldOptions = options.length > 0 ? options : (uiProperties?.selectOptions || []);

    const renderInput = () => {
      if (fieldOptions.length > 0) {
        return (
          <Select
            value={value}
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

      return (
        <Input
          type="text"
          value={value}
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

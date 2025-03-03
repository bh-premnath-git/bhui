import React from 'react';
import { Label } from '@/components/ui/label';
import { FieldGroupProps } from './types';
import { FormField } from './FormField';

export const FieldGroup: React.FC<FieldGroupProps> = ({ 
  operator, 
  groupKey, 
  fields, 
  formValues, 
  formErrors, 
  fieldTypeMapping, 
  onChange 
}) => {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-2">
      {groupKey !== 'other' && (
        <h4 className="text-xs font-medium uppercase text-gray-500 mb-2">
          {groupKey}
        </h4>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map(field => {
          const fieldInfo = fieldTypeMapping[operator]?.[field] || { type: 'string', required: false };
          const value = formValues[operator]?.[field] || '';
          const hasError = formErrors[operator]?.[field] || false;
          const spanCols = fieldInfo.uiProperties?.spanCol === 1 ? 1 : 2;
          
          return (
            <div key={field} className={`grid gap-1.5 ${spanCols === 2 ? 'md:col-span-2' : ''}`}>
              <Label
                htmlFor={`${operator}-${field}`}
                className={`text-xs ${fieldInfo.required ? 'font-medium' : ''}`}
              >
                {fieldInfo.uiProperties?.propertyName || field}
                {fieldInfo.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <FormField
                operator={operator}
                field={field}
                value={value}
                hasError={hasError}
                fieldInfo={fieldInfo}
                onChange={onChange}
              />
              {hasError && <p className="text-xs text-red-500">This field is required</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { FieldRenderer } from './FieldRenderer';
import { ArrayField } from './ArrayField';
import { FormFields } from '@/features/admin/connection/components/FormFields';

interface ConditionalFieldRendererProps {
  fieldKey: string;
  field: any;
  form: any;
  isRequired?: boolean;
  parentPath?: string;
}

export const ConditionalFieldRenderer: React.FC<ConditionalFieldRendererProps> = ({
  fieldKey,
  field,
  form,
  isRequired = false,
  parentPath = '',
}) => {
  const fieldTitle = field.title || fieldKey;

  // Handle array fields specially
  if (field.type === 'array') {
    return (
      <ArrayField
        field={field}
        fieldKey={fieldKey}
        form={form}
        isRequired={isRequired}
        title={fieldTitle}
        parentPath={parentPath}
      />
    );
  }

  // Handle structured object fields
  if (field.type === 'object' && field.properties) {
    return (
      <div className="space-y-2">
        <div className="p-2">
          <FormFields 
            schema={field} 
            form={form}
            parentKey={fieldKey}
            twoColumnLayout={true}
            mode="new"
          />
        </div>
      </div>
    );
  }

  // For all other field types, use the regular FieldRenderer
  return (
    <FieldRenderer
      fieldKey={fieldKey}
      field={field}
      form={form}
      isRequired={isRequired}
      parentPath={parentPath}
    />
  );
};
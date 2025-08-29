import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { FieldRenderer } from './FieldRenderer';
import { NestedArrayField } from './NestedArrayField';
import { getActiveFields, extractPropertiesFromSchema } from './schemaUtils';

interface ConditionalArrayItemProps {
  field: any;
  item: any;
  index: number;
  fullFieldKey: string;
  onRemove: (index: number) => void;
  canRemove: boolean;
  sourceColumns?: Array<{ name: string; dataType: string }>;
  onExpressionGenerate?: (fieldName: string) => Promise<void>;
  isFieldGenerating?: (fieldName: string) => boolean;
}

export const ConditionalArrayItem: React.FC<ConditionalArrayItemProps> = ({
  field,
  item,
  index,
  fullFieldKey,
  onRemove,
  canRemove,
  sourceColumns = [],
  onExpressionGenerate,
  isFieldGenerating,
}) => {
  const form = useFormContext();
  
  // Watch the specific array item values to trigger re-renders when they change
  const itemPath = `${fullFieldKey}.${index}`;
  const itemValues = form.watch(itemPath) || {};

  // Get active fields based on current item values using conditional logic
  const { properties, required } = useMemo(() => {
    // Use conditional logic to get active fields for this specific array item
    let properties = field.items?.properties;
    let required = field.items?.required || [];
    
    // If the field has conditional logic (allOf), use getActiveFields with current item values
    if (field.items?.allOf || !properties) {
      const currentItemValues = itemValues || {};
      const activeFields = getActiveFields(field.items, currentItemValues);
      properties = activeFields.fields;
      required = activeFields.required;
      
      // Debug logging for array item conditional logic
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Array item [${index}] conditional fields updated:`, {
          fieldKey: fullFieldKey,
          currentItemValues,
          activeFields: Object.keys(properties),
          requiredFields: required,
          hasAllOf: !!field.items?.allOf
        });
      }
    } else if (!properties) {
      // Fallback to extractPropertiesFromSchema for simple cases
      const extracted = extractPropertiesFromSchema(field.items);
      properties = extracted.properties;
      required = extracted.required;
    }
    
    return { properties, required };
  }, [field.items, itemValues, fullFieldKey, index]);

  if (!properties || Object.keys(properties).length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No properties found for this object type
      </div>
    );
  }
  
  // Organize fields for better layout
  const fieldEntries = Object.entries(properties);
  const simpleFields = fieldEntries.filter(([, propField]: [string, any]) => 
    propField.type !== 'array' && propField.type !== 'object'
  );
  const complexFields = fieldEntries.filter(([, propField]: [string, any]) => 
    propField.type === 'array' || propField.type === 'object'
  );
  
  return (
    <div className="space-y-4">
      {/* Simple fields with inline delete button */}
      {simpleFields.length > 0 && (
        <div className="flex items-start gap-2">
          <div className={`flex-1 grid gap-4 ${simpleFields.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {simpleFields.map(([propKey, propField]: [string, any]) => (
              <FieldRenderer
                key={propKey}
                fieldKey={propKey}
                field={propField}
                form={form}
                isRequired={required.includes(propKey)}
                parentKey={itemPath}
                sourceColumns={sourceColumns}
                onExpressionGenerate={onExpressionGenerate}
                isFieldGenerating={isFieldGenerating}
              />
            ))}
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-destructive hover:text-destructive h-8 w-8 p-0 hover:bg-destructive/10 transition-colors duration-200 flex-shrink-0 mt-6"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
      
      {/* Complex fields (arrays, objects) with inline delete */}
      {complexFields.map(([propKey, propField]: [string, any]) => (
        <div key={propKey} className="flex items-start gap-2">
          <div className="flex-1">
            {propField.type === 'array' ? (
              <NestedArrayField
                field={propField}
                fieldKey={propKey}
                form={form}
                isRequired={required.includes(propKey)}
                title={propField.title || propKey}
                parentPath={itemPath}
              />
            ) : (
              <FieldRenderer
                fieldKey={propKey}
                field={propField}
                form={form}
                isRequired={required.includes(propKey)}
                parentKey={itemPath}
                sourceColumns={sourceColumns}
                onExpressionGenerate={onExpressionGenerate}
                isFieldGenerating={isFieldGenerating}
              />
            )}
          </div>
          {canRemove && simpleFields.length === 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-destructive hover:text-destructive h-8 w-8 p-0 hover:bg-destructive/10 transition-colors duration-200 flex-shrink-0 mt-6"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
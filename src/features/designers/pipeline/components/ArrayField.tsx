import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { FormFields } from '@/features/admin/connection/components/FormFields';
import { FieldRenderer } from './FieldRenderer';
import { NestedArrayField } from './NestedArrayField';
import { ConditionalArrayItem } from './ConditionalArrayItem';
import { extractPropertiesFromSchema, getDefaultValueForField, formatFieldTitle, getActiveFields } from './schemaUtils';

interface ArrayFieldProps {
  field: any;
  fieldKey: string;
  form: any;
  isRequired: boolean;
  title: string;
  parentPath?: string;
  sourceColumns?: Array<{ name: string; dataType: string }>;
  onExpressionGenerate?: (fieldName: string) => Promise<void>;
  isFieldGenerating?: (fieldName: string) => boolean;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({
  field,
  fieldKey,
  form,
  isRequired,
  title,
  parentPath,
  sourceColumns = [],
  onExpressionGenerate,
  isFieldGenerating,
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const fullFieldKey = parentPath ? `${parentPath}.${fieldKey}` : fieldKey;
  const keyCounter = useRef(0);
  const isInitialized = useRef(false);
  
  return (
    <FormField
      control={form.control}
      name={fullFieldKey}
      render={({ field: formField }) => {
        // Ensure values is always an array and each item has a unique key
        const values = (formField.value || []).map((item: any, index: number) => ({
          ...item,
          _key: item._key || `item_${++keyCounter.current}_${Date.now()}`
        }));
        
        const addItem = () => {
          const newItem: any = {};
          
          if (field.items?.type === 'object' || field.items?.properties) {
            // For object arrays, add an empty object with default values
            let properties = field.items?.properties;
            
            // If the field has conditional logic, get base fields first
            if (field.items?.allOf || !properties) {
              // Get active fields with empty values to get base fields
              const activeFields = getActiveFields(field.items, {});
              properties = activeFields.fields;
              
              // Debug logging for new item initialization
              if (process.env.NODE_ENV === 'development') {
                console.log(`🆕 Initializing new array item:`, {
                  fieldKey: fullFieldKey,
                  baseFields: Object.keys(properties),
                  hasAllOf: !!field.items?.allOf
                });
              }
            } else if (!properties) {
              // Fallback to extractPropertiesFromSchema for simple cases
              const extracted = extractPropertiesFromSchema(field.items);
              properties = extracted.properties;
            }
            
            if (properties) {
              Object.entries(properties).forEach(([propKey, propField]:any) => {
                newItem[propKey] = getDefaultValueForField(propField);
              });
            }
          } else {
            // For primitive arrays, add appropriate default value
            if (field.items?.type === 'number' || field.items?.type === 'integer') {
              newItem.value = 0;
            } else if (field.items?.type === 'boolean') {
              newItem.value = false;
            } else {
              newItem.value = '';
            }
          }
          
          // Add unique key for React reconciliation
          newItem._key = `item_${++keyCounter.current}_${Date.now()}`;
          
          const newValues = [...values, newItem];
          formField.onChange(newValues);
        };
        
        const removeItem = (index: number) => {
          const newValues = values.filter((_: any, i: number) => i !== index);
          formField.onChange(newValues);
        };
        
        const updateItem = (index: number, updatedValue: any) => {
          const newValues = [...values];
          // Preserve the _key when updating
          newValues[index] = { ...updatedValue, _key: values[index]._key };
          formField.onChange(newValues);
        };
        
        // Initialize with one empty item if no values exist, and ensure existing values have keys
        React.useEffect(() => {
          const currentFormValue = formField.value || [];
          
          // Only initialize once to prevent interference with form updates
          if (!isInitialized.current) {
            if (currentFormValue.length === 0) {
              // Only add item if truly empty
              addItem();
              isInitialized.current = true;
            } else if (currentFormValue.length > 0) {
              // Ensure existing values have _key properties
              const hasKeysAlready = currentFormValue.every((item: any) => 
                typeof item === 'object' && item !== null && '_key' in item
              );
              
              if (!hasKeysAlready) {
                const valuesWithKeys = currentFormValue.map((item: any, index: number) => ({
                  ...(typeof item === 'object' && item !== null ? item : { value: item }),
                  _key: `item_${++keyCounter.current}_${Date.now()}_${index}`
                }));
                formField.onChange(valuesWithKeys);
              }
              isInitialized.current = true;
            }
          }
        }, [formField.value]);

        return (
          <FormItem className="col-span-2 w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FormLabel className="text-sm font-medium">
                  {title}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                {field.description && (
                  <div className="group relative">
                    <div className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs cursor-help">
                      ?
                    </div>
                    <div className="absolute left-0 top-6 w-64 p-2 bg-popover border rounded-md shadow-md text-xs text-popover-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {field.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {values.map((item: any, index: number) => (
                <div key={item._key} className="relative ">
                  {/* Content area with inline delete */}
                  <div className="p-4">
                    {(field.items?.type === 'object' || field.items?.properties) ? (
                      // Render object fields using ConditionalArrayItem for proper conditional logic
                      <ConditionalArrayItem
                        field={field}
                        item={item}
                        index={index}
                        fullFieldKey={fullFieldKey}
                        onRemove={removeItem}
                        canRemove={values.length > 1}
                        sourceColumns={sourceColumns}
                        onExpressionGenerate={onExpressionGenerate}
                        isFieldGenerating={isFieldGenerating}
                      />
                    ) : (
                      // Render primitive fields
                      <FieldRenderer
                        fieldKey="value"
                        field={{...field.items, type: field.items?.type || 'string'}}
                        form={form}
                        parentKey={`${fullFieldKey}.${index}`}
                        sourceColumns={sourceColumns}
                        onExpressionGenerate={onExpressionGenerate}
                        isFieldGenerating={isFieldGenerating}
                      />
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add another button */}
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-1 h-8 px-3 text-xs border-dashed"
                >
                  <Plus className="w-3 h-3" />
                  Add Another {title.slice(0, -1)}
                </Button>
              </div>
            </div>
            
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
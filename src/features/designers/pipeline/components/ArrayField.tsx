import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { FormFields } from '@/features/admin/connection/components/FormFields';
import { FieldRenderer } from './FieldRenderer';
import { NestedArrayField } from './NestedArrayField';
import { extractPropertiesFromSchema, getDefaultValueForField } from './schemaUtils';

interface ArrayFieldProps {
  field: any;
  fieldKey: string;
  form: any;
  isRequired: boolean;
  title: string;
  parentPath?: string;
  sourceColumns?: Array<{ name: string; dataType: string }>;
  onExpressionGenerate?: (fieldName: string) => Promise<void>;
  isGenerating?: boolean;
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
  isGenerating = false,
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const fullFieldKey = parentPath ? `${parentPath}.${fieldKey}` : fieldKey;
  
  return (
    <FormField
      control={form.control}
      name={fullFieldKey}
      render={({ field: formField }) => {
        const values = formField.value || [];
        
        const addItem = () => {
          const newValues = [...values];
          
          if (field.items?.type === 'object' || field.items?.properties) {
            // For object arrays, add an empty object with default values
            let properties = field.items?.properties;
            
            // If no direct properties, use schema utils
            if (!properties) {
              const extracted = extractPropertiesFromSchema(field.items);
              properties = extracted.properties;
            }
            
            const newItem: any = {};
            
            if (properties) {
              Object.entries(properties).forEach(([propKey, propField]:any) => {
                newItem[propKey] = getDefaultValueForField(propField);
              });
            }
            
            newValues.push(newItem);
          } else {
            // For primitive arrays, add appropriate default value
            if (field.items?.type === 'number' || field.items?.type === 'integer') {
              newValues.push(0);
            } else if (field.items?.type === 'boolean') {
              newValues.push(false);
            } else {
              newValues.push('');
            }
          }
          
          formField.onChange(newValues);
        };
        
        const removeItem = (index: number) => {
          const newValues = values.filter((_: any, i: number) => i !== index);
          formField.onChange(newValues);
        };
        
        const updateItem = (index: number, value: any) => {
          const newValues = [...values];
          newValues[index] = value;
          formField.onChange(newValues);
        };
        
        // Initialize with one empty item if no values exist
        React.useEffect(() => {
          if (values.length === 0) {
            addItem();
          }
        }, []);

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
                <div key={index} className="relative ">
                  {/* Content area with inline delete */}
                  <div className="p-4">
                    {(field.items?.type === 'object' || field.items?.properties) ? (
                      // Render object fields
                      <div className="space-y-4">
                        {(() => {
                          // First try direct properties (most common case)
                          let properties = field.items?.properties;
                          let required = field.items?.required || [];
                          
                          // If no direct properties, use schema utils for complex cases
                          if (!properties) {
                            const extracted = extractPropertiesFromSchema(field.items);
                            properties = extracted.properties;
                            required = extracted.required;
                          }
                          
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
                                        parentPath={`${fullFieldKey}.${index}`}
                                        sourceColumns={sourceColumns}
                                        onExpressionGenerate={onExpressionGenerate}
                                        isGenerating={isGenerating}
                                      />
                                    ))}
                                  </div>
                                  {values.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeItem(index)}
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
                                        parentPath={`${fullFieldKey}.${index}`}
                                      />
                                    ) : (
                                      <FieldRenderer
                                        fieldKey={propKey}
                                        field={propField}
                                        form={form}
                                        isRequired={required.includes(propKey)}
                                        parentPath={`${fullFieldKey}.${index}`}
                                        sourceColumns={sourceColumns}
                                        onExpressionGenerate={onExpressionGenerate}
                                        isGenerating={isGenerating}
                                      />
                                    )}
                                  </div>
                                  {values.length > 1 && simpleFields.length === 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeItem(index)}
                                      className="text-destructive hover:text-destructive h-8 w-8 p-0 hover:bg-destructive/10 transition-colors duration-200 flex-shrink-0 mt-6"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      // Render primitive fields
                      <FieldRenderer
                        fieldKey={index.toString()}
                        field={field.items}
                        form={form}
                        parentPath={fullFieldKey}
                        sourceColumns={sourceColumns}
                        onExpressionGenerate={onExpressionGenerate}
                        isGenerating={isGenerating}
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
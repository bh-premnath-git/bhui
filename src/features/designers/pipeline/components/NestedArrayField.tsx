import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { KeyValueEditor } from './KeyValueEditor';
import { Plus, Trash2 } from 'lucide-react';
import { formatFieldTitle } from './schemaUtils';

interface NestedArrayFieldProps {
  field: any;
  fieldKey: string;
  form: any;
  isRequired: boolean;
  title: string;
  parentPath: string;
}

export const NestedArrayField: React.FC<NestedArrayFieldProps> = ({
  field,
  fieldKey,
  form,
  isRequired,
  title,
  parentPath,
}) => {
  const fullFieldKey = `${parentPath}.${fieldKey}`;
  
  return (
    <FormField
      control={form.control}
      name={fullFieldKey}
      render={({ field: formField }) => {
        const values = formField.value || [];
        
        const addItem = () => {
          const newValues = [...values];
          
          if (field.items?.type === 'object') {
            // For object arrays, add an empty object with default values
            const newItem: any = {};
            if (field.items?.properties) {
              Object.entries(field.items.properties).forEach(([propKey, propField]: [string, any]) => {
                if (propField.default !== undefined) {
                  newItem[propKey] = propField.default;
                } else if (propField.type === 'string') {
                  newItem[propKey] = '';
                } else if (propField.type === 'number' || propField.type === 'integer') {
                  newItem[propKey] = 0;
                } else if (propField.type === 'boolean') {
                  newItem[propKey] = false;
                } else if (propField.type === 'array') {
                  newItem[propKey] = [];
                } else if (propField.type === 'object') {
                  newItem[propKey] = {};
                }
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
        
        // Initialize with one empty item if no values exist
        React.useEffect(() => {
          if (values.length === 0) {
            addItem();
          }
        }, []);

        return (
          <FormItem className="w-full">
            <div className="flex items-center justify-between mb-2">
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
            

            
            <div className="space-y-2">
              {values.map((item: any, index: number) => (
                <div key={index} className="relative border rounded-md bg-card shadow-sm">
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                    {field.items?.type === 'object' ? (
                      // Render object fields inline
                      <div className="grid grid-cols-1 gap-3">
                        {field.items?.properties && Object.entries(field.items.properties).map(([propKey, propField]: [string, any]) => (
                          <FormField
                            key={propKey}
                            control={form.control}
                            name={`${fullFieldKey}.${index}.${propKey}`}
                            render={({ field: nestedField }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  {propField.title || formatFieldTitle(propKey)}
                                  {field.items.required?.includes(propKey) && (
                                    <span className="text-destructive ml-1">*</span>
                                  )}
                                </FormLabel>
                                <FormControl>
                                  {propField.type === 'string' && propField.format === 'textarea' ? (
                                    <Textarea
                                      {...nestedField}
                                      placeholder={propField.examples?.[0] || propField.default || ''}
                                      rows={2}
                                      className="text-sm"
                                    />
                                  ) : propField.type === 'object' ? (
                                    // Check if it's a key-value object or structured object
                                    propField.additionalProperties && !propField.properties ? (
                                      <KeyValueEditor
                                        value={nestedField.value || {}}
                                        onChange={nestedField.onChange}
                                        placeholder={`Add ${propKey} parameter`}
                                      />
                                    ) : (
                                      <Textarea
                                        {...nestedField}
                                        value={typeof nestedField.value === 'object' ? JSON.stringify(nestedField.value, null, 2) : nestedField.value || ''}
                                        onChange={(e) => {
                                          try {
                                            const parsed = JSON.parse(e.target.value);
                                            nestedField.onChange(parsed);
                                          } catch {
                                            nestedField.onChange(e.target.value);
                                          }
                                        }}
                                        placeholder="Enter JSON object"
                                        rows={2}
                                        className="text-sm font-mono"
                                      />
                                    )
                                  ) : (
                                    <Input
                                      {...nestedField}
                                      type={
                                        propField.type === 'number' || propField.type === 'integer'
                                          ? 'number'
                                          : 'text'
                                      }
                                      placeholder={propField.examples?.[0] || propField.default || ''}
                                      className="text-sm"
                                    />
                                  )}
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    ) : (
                      // Render primitive field
                      <FormField
                        control={form.control}
                        name={`${fullFieldKey}.${index}`}
                        render={({ field: primitiveField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...primitiveField}
                                type={
                                  field.items?.type === 'number' || field.items?.type === 'integer'
                                    ? 'number'
                                    : 'text'
                                }
                                placeholder={field.items?.examples?.[0] || field.items?.default || 'Enter value...'}
                                className="text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                      </div>
                      {values.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0 hover:bg-destructive/10 transition-colors duration-200 flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add another button */}
              <div className="flex justify-center pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-1 h-7 px-2 text-xs border-dashed"
                >
                  <Plus className="w-3 h-3" />
                  Add Another
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
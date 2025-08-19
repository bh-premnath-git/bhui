import React, { useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { FieldRenderer } from './FieldRenderer';
import { ArrayField } from './ArrayField';
import { ConditionalSchemaRenderer } from './ConditionalSchemaRenderer';
import { getActiveFields, getDefaultValueForField, formatFieldTitle, extractPropertiesFromSchema } from './schemaUtils';
import { cn } from '@/lib/utils';

interface TableArrayFieldProps {
  field: any;
  fieldKey: string;
  form: any;
  isRequired: boolean;
  title?: string;
  parentPath?: string;
  sourceColumns?: Array<{ name: string; dataType: string }>;
  onExpressionGenerate?: (fieldName: string) => Promise<void>;
  isFieldGenerating?: (fieldName: string) => boolean;
}

export const TableArrayField: React.FC<TableArrayFieldProps> = ({
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
  const fullFieldKey = parentPath ? `${parentPath}.${fieldKey}` : fieldKey;
  const keyCounter = useRef(0);
  
  // Watch form values to make table reactive to changes
  const formValues = form.watch();
  
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
        
        // Get all possible columns by analyzing the schema and current values
        const { allColumns, hasComplexFields } = useMemo(() => {
          const columnSet = new Set<string>();
          let hasComplexFields = false;
          
          // Get base fields from schema
          if (field.items?.properties) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`🔍 TableArrayField: Found schema properties for (${fieldKey}):`, {
                fieldKey,
                properties: Object.keys(field.items.properties),
                fullProperties: field.items.properties
              });
            }
            Object.entries(field.items.properties).forEach(([key, fieldDef]: [string, any]) => {
              columnSet.add(key);
              if (process.env.NODE_ENV === 'development') {
                console.log(`➕ TableArrayField: Added column "${key}" from schema properties`);
              }
              // Check if this field is too complex for table display
              // Simple arrays (like string arrays) are okay, but complex nested arrays are not
              if (fieldDef.type === 'array' && fieldDef.items?.type === 'object' && fieldDef.items?.properties) {
                // This is an array of objects - too complex for inline table display
                hasComplexFields = true;
              }
              // Objects are okay in table cells, but deeply nested objects with their own conditional logic might be too complex
              if (fieldDef.type === 'object' && fieldDef.allOf && fieldDef.allOf.length > 2) {
                hasComplexFields = true;
              }
            });
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.log(`❌ TableArrayField: No schema properties found for (${fieldKey}):`, {
                fieldKey,
                hasItems: !!field.items,
                itemsStructure: field.items
              });
            }
          }
          
          // If using conditional logic, get all possible fields by checking each item AND all possible conditions
          if (field.items?.allOf) {
            // Check current values
            values.forEach((item: any) => {
              const activeFields = getActiveFields(field.items, item);
              Object.entries(activeFields.fields).forEach(([key, fieldDef]: [string, any]) => {
                columnSet.add(key);
                // Check if this field is too complex for table display
                // Simple arrays (like string arrays) are okay, but complex nested arrays are not
                if (fieldDef.type === 'array' && fieldDef.items?.type === 'object' && fieldDef.items?.properties) {
                  // This is an array of objects - too complex for inline table display
                  hasComplexFields = true;
                }
                // Objects are okay, but deeply nested objects might be too complex
                if (fieldDef.type === 'object' && fieldDef.allOf && fieldDef.allOf.length > 2) {
                  hasComplexFields = true;
                }
              });
            });
            
            // Also get base fields with empty values to ensure we have all possible columns
            const baseFields = getActiveFields(field.items, {});
            Object.entries(baseFields.fields).forEach(([key, fieldDef]: [string, any]) => {
              columnSet.add(key);
              if (fieldDef.type === 'array' && fieldDef.items?.type === 'object' && fieldDef.items?.properties) {
                hasComplexFields = true;
              }
              if (fieldDef.type === 'object' && fieldDef.allOf && fieldDef.allOf.length > 2) {
                hasComplexFields = true;
              }
            });

            // For DataQuality and other conditional schemas, try to discover all possible fields
            // by analyzing all conditional branches
            try {
              field.items.allOf.forEach((condition: any) => {
                if (condition.then?.properties) {
                  Object.entries(condition.then.properties).forEach(([key, fieldDef]: [string, any]) => {
                    columnSet.add(key);
                    if (fieldDef.type === 'array' && fieldDef.items?.type === 'object' && fieldDef.items?.properties) {
                      hasComplexFields = true;
                    }
                    if (fieldDef.type === 'object' && fieldDef.allOf && fieldDef.allOf.length > 2) {
                      hasComplexFields = true;
                    }
                  });
                }
                
                // Also check nested allOf structures for more fields
                if (condition.then?.allOf) {
                  condition.then.allOf.forEach((nestedCondition: any) => {
                    if (nestedCondition.then?.properties) {
                      Object.entries(nestedCondition.then.properties).forEach(([key, fieldDef]: [string, any]) => {
                        columnSet.add(key);
                        if (fieldDef.type === 'array' && fieldDef.items?.type === 'object' && fieldDef.items?.properties) {
                          hasComplexFields = true;
                        }
                        if (fieldDef.type === 'object' && fieldDef.allOf && fieldDef.allOf.length > 2) {
                          hasComplexFields = true;
                        }
                      });
                    }
                  });
                }
              });
            } catch (error) {
              console.warn('Error analyzing conditional schema branches:', error);
            }
          }
          
          // If no columns found but we have values, try to infer from the values themselves
          // This helps with transformations that don't have explicit schema properties
          if (columnSet.size === 0 && values.length > 0) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`🔍 TableArrayField: No columns from schema, trying to infer from values for (${fieldKey}):`, {
                fieldKey,
                valuesCount: values.length,
                sampleValues: values.slice(0, 2)
              });
            }
            const inferredColumns = new Set();
            values.forEach((item: any) => {
              if (item && typeof item === 'object') {
                Object.keys(item).forEach(key => {
                  if (key !== '_key') { // Skip internal keys
                    columnSet.add(key);
                    inferredColumns.add(key);
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`➕ TableArrayField: Inferred column "${key}" from value data`);
                    }
                  }
                });
              }
            });
            
            if (process.env.NODE_ENV === 'development' && inferredColumns.size > 0) {
              console.log(`📊 TableArrayField: Inferred columns from values for (${fieldKey}):`, {
                fieldKey,
                inferredColumns: Array.from(inferredColumns),
                totalValues: values.length
              });
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.log(`✅ TableArrayField: Found ${columnSet.size} columns from schema for (${fieldKey}):`, {
              fieldKey,
              columnsFromSchema: Array.from(columnSet),
              skipValueInference: true
            });
          }
          
          return { 
            allColumns: Array.from(columnSet), 
            hasComplexFields 
          };
        }, [field.items, values, formValues]);
        
        // Debug logging for field analysis
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 TableArrayField: Analyzing field (${fieldKey})`, {
            fieldKey,
            title,
            hasComplexFields,
            fieldItemsKeys: field.items?.properties ? Object.keys(field.items.properties) : [],
            allColumnsCount: allColumns.length,
            allColumns: allColumns,
            valuesCount: values.length,
            hasConditionalLogic: !!field.items?.allOf,
            schemaType: field.items?.allOf ? 'conditional' : 'simple',
            willFallbackToCards: hasComplexFields,
            // Enhanced debugging for schema structure
            fieldItemsStructure: {
              hasProperties: !!field.items?.properties,
              propertiesKeys: field.items?.properties ? Object.keys(field.items.properties) : [],
              hasAllOf: !!field.items?.allOf,
              hasRequired: !!field.items?.required,
              requiredFields: field.items?.required || [],
              fullItemsSchema: field.items
            },
            // Debug the actual values to see what columns should be inferred
            sampleValues: values.slice(0, 2)
          });
        }

        // Check for extremely complex cases that should still fall back to card view
        // Only fall back for deeply nested arrays (arrays of arrays of arrays) or very complex structures
        const hasDeeplyNestedArrays = allColumns.some(columnKey => {
          const columnField = field.items?.properties?.[columnKey];
          // Fall back only if we have arrays of objects with arrays (3+ levels deep)
          return columnField?.type === 'array' && 
                 columnField?.items?.type === 'object' && 
                 columnField?.items?.properties &&
                 Object.values(columnField.items.properties).some((prop: any) => prop.type === 'array');
        });

        if (hasDeeplyNestedArrays) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`⚠️ TableArrayField: Falling back to card view for (${fieldKey}) due to deeply nested arrays (3+ levels)`);
          }
          return (
            <div className="p-2 bg-muted/20 rounded-md">
              <ArrayField
                field={field}
                fieldKey={fieldKey}
                form={form}
                isRequired={isRequired}
                title={title}
                parentPath={parentPath}
                sourceColumns={sourceColumns}
                onExpressionGenerate={onExpressionGenerate}
                isFieldGenerating={isFieldGenerating}
              />
            </div>
          );
        }

        const addItem = () => {
          const newItem: any = {};
          
          if (field.items?.type === 'object' || field.items?.properties) {
            // For object arrays, add an empty object with default values
            let properties = field.items?.properties;
            
            // Debug logging for hints array specifically 
            if (process.env.NODE_ENV === 'development' && (fieldKey === 'hints' || fullFieldKey.includes('hints'))) {
              console.log(`🆕 TableArrayField: Adding new hints item:`, {
                fullFieldKey,
                fieldItems: field.items,
                hasDirectProperties: !!field.items?.properties,
                directPropertiesKeys: field.items?.properties ? Object.keys(field.items.properties) : [],
                hasAllOf: !!field.items?.allOf
              });
            }
            
            // If the field has conditional logic, get base fields first
            if (field.items?.allOf || !properties) {
              // Get active fields with empty values to get base fields
              const activeFields = getActiveFields(field.items, {});
              properties = activeFields.fields;
              
              // Debug logging for new item initialization
              if (process.env.NODE_ENV === 'development') {
                console.log(`🆕 TableArrayField: Initializing new array item:`, {
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
              
              // Debug logging for hints array item creation
              if (process.env.NODE_ENV === 'development' && (fieldKey === 'hints' || fullFieldKey.includes('hints'))) {
                console.log(`🆕 TableArrayField: Created hints item with properties:`, {
                  fullFieldKey,
                  newItem,
                  propertiesUsed: Object.keys(properties),
                  itemKeys: Object.keys(newItem)
                });
              }
            }
          } else {
            // For primitive arrays, use the simple approach
            const defaultValue = getDefaultValueForField(field.items);
            if (typeof defaultValue === 'object') {
              Object.assign(newItem, defaultValue);
            } else {
              newItem.value = defaultValue;
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

        const updateItem = (index: number, newValue: any) => {
          const newValues = [...values];
          newValues[index] = { ...newValue, _key: values[index]._key };
          formField.onChange(newValues);
        };

        // Initialize with one empty item if no values exist, and ensure existing values have keys
        React.useEffect(() => {
          const currentFormValue = formField.value || [];
          
          if (currentFormValue.length === 0) {
            // For required arrays or arrays that should start with an item, add one
            if (isRequired || field.minItems > 0) {
              addItem();
            }
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
          }
        }, [formField.value, isRequired, field.minItems]);

        // Simple table view for primitive arrays only (not object arrays)
        // Object arrays should always use the advanced table view to show proper column names
        if (allColumns.length <= 3 && !field.items?.allOf && field.items?.type !== 'object' && !field.items?.properties) {
          const canRemoveItems = values.length > 1 && (!isRequired || values.length > (field.minItems || 1));
          const showActionsColumn = canRemoveItems || values.length > 1;
          
          return (
            <FormItem className="col-span-2 w-full">
              <div className="flex items-center justify-between mb-3">
                <FormLabel className="text-sm font-medium">
                  {title || formatFieldTitle(fieldKey)}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
              </div>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="py-3 px-3 text-xs font-medium">Value</TableHead>
                      {showActionsColumn && (
                        <TableHead className="w-16 py-3 px-3 text-xs font-medium text-center">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {values.map((item: any, index: number) => (
                      <TableRow key={item._key}>
                        <TableCell className="py-3 px-3">
                          <FieldRenderer
                            fieldKey="value"
                            field={field.items}
                            form={form}
                            isRequired={true}
                            parentKey={`${fullFieldKey}.${index}`}
                            sourceColumns={sourceColumns}
                            onExpressionGenerate={onExpressionGenerate}
                            isFieldGenerating={isFieldGenerating}
                            hideLabel={true}
                            compact={true}
                          />
                        </TableCell>
                        {showActionsColumn && (
                          <TableCell className="py-3 px-3 text-center w-16">
                            {canRemoveItems && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-destructive hover:text-destructive h-8 w-8 p-0 hover:bg-destructive/10 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-center pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-1 h-8 px-3 text-xs border-dashed hover:border-solid transition-all"
                >
                  <Plus className="w-3 h-3" />
                  Add Another {(title || formatFieldTitle(fieldKey)).slice(0, -1)}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          );
        }

        // Check if we need to show actions column (when multiple rows exist or can be added/deleted)
        const canRemoveItems = values.length > 1 && (!isRequired || values.length > (field.minItems || 1));
        const showActionsColumn = canRemoveItems || values.length > 1;
        
        // Calculate column widths for better alignment
        const totalColumns = allColumns.length + (showActionsColumn ? 1 : 0);
        const columnWidth = showActionsColumn 
          ? `calc((100% - 4rem) / ${allColumns.length})` // Reserve 4rem for actions column
          : `calc(100% / ${allColumns.length})`;

        // Advanced table view for complex arrays with multiple columns
        return (
          <FormItem className="col-span-2 w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FormLabel className="text-sm font-medium">
                  {title || formatFieldTitle(fieldKey)}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                {field.items?.allOf && (
                  <div className="group relative">
                    <div className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs cursor-help">
                      ?
                    </div>
                    <div className="absolute left-0 top-6 w-64 p-2 bg-popover border rounded-md shadow-md text-xs text-popover-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      This table shows dynamic columns based on your selections. Columns will appear and disappear as you change field values.
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="rounded-md border monaco-table-container" style={{ overflow: 'visible' }}>
              <Table className="relative" style={{ overflow: 'visible' }}>
                <TableHeader className={cn(showActionsColumn ? "" : "")}>
                  <TableRow className="bg-muted/50">
                    {allColumns.map((columnKey) => {
                      // Get field definition for this column
                      let columnField = field.items?.properties?.[columnKey];
                      
                      // If using conditional logic, get field from active fields
                      if (!columnField && field.items?.allOf) {
                        const activeFields = getActiveFields(field.items, {});
                        columnField = activeFields.fields[columnKey];
                      }
                      
                      const columnTitle = columnField?.title || formatFieldTitle(columnKey);
                      
                      return (
                        <TableHead 
                          key={columnKey} 
                          className="text-xs font-medium py-3 px-3 text-left"
                          style={{ width: columnWidth, minWidth: '120px' }}
                        >
                          {columnTitle}
                        </TableHead>
                      );
                    })}
                    {showActionsColumn && (
                      <TableHead className="w-16 text-xs font-medium py-3 px-3 text-center">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody style={{ overflow: 'visible' }}>
                  {values.map((item: any, index: number) => {
                    const itemPath = `${fullFieldKey}.${index}`;
                    
                    // Get the current form values for this specific item to ensure we have the latest data
                    const currentItemValues = form.getValues(`${fullFieldKey}.${index}`) || item;
                    
                    // Get active fields for this specific item using the most current values
                    const activeFields = field.items?.allOf 
                      ? getActiveFields(field.items, currentItemValues)
                      : { fields: field.items?.properties || {}, required: field.items?.required || [] };
                    
                    // Debug logging for this specific row
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`🔍 TableArrayField Row ${index}:`, {
                        originalItem: item,
                        currentItemValues,
                        activeFields: Object.keys(activeFields.fields),
                        allColumns,
                        itemPath,
                        hasConditionalLogic: !!field.items?.allOf
                      });
                    }

                    return (
                      <TableRow key={item._key} style={{ overflow: 'visible' }}>
                        {allColumns.map((columnKey) => {
                          const columnField = activeFields.fields[columnKey];
                          const isRequired = activeFields.required.includes(columnKey);
                          
                          // Debug logging for missing fields
                          if (process.env.NODE_ENV === 'development' && !columnField) {
                            console.log(`❌ Missing field for column ${columnKey} in row ${index}:`, {
                              columnKey,
                              originalItem: item,
                              currentItemValues,
                              activeFieldsKeys: Object.keys(activeFields.fields),
                              expectedField: columnKey,
                              availableFields: Object.keys(activeFields.fields),
                              hasConditionalLogic: !!field.items?.allOf
                            });
                          }
                          
                          return (
                            <TableCell 
                              key={columnKey} 
                              className="py-3 px-3 align-top relative"
                              style={{ 
                                width: columnWidth, 
                                minWidth: '120px',
                                // Allow Monaco editor suggestions to overflow table cell boundaries
                                overflow: 'visible',
                                position: 'relative'
                              }}
                            >
                              {columnField ? (
                                <div className="min-w-0 w-full">
                                  {columnField.type === 'object' ? (
                                    // Special handling for object fields in table cells
                                    <div className="space-y-1">
                                      {process.env.NODE_ENV === 'development' && console.log(`🏗️ TableArrayField: Rendering object field ${columnKey} in table cell`)}
                                      <ConditionalSchemaRenderer
                                        schema={columnField}
                                        formValues={form.getValues(`${itemPath}.${columnKey}`)}
                                        form={form}
                                        parentKey={`${itemPath}.${columnKey}`}
                                        useTableView={false}
                                        sourceColumns={sourceColumns}
                                        onExpressionGenerate={onExpressionGenerate}
                                        isFieldGenerating={isFieldGenerating}
                                      />
                                    </div>
                                  ) : (
                                    // Regular field rendering for non-object fields
                                    <FieldRenderer
                                      fieldKey={columnKey}
                                      field={columnField}
                                      form={form}
                                      isRequired={isRequired}
                                      parentKey={itemPath}
                                      sourceColumns={sourceColumns}
                                      onExpressionGenerate={onExpressionGenerate}
                                      isFieldGenerating={isFieldGenerating}
                                      hideLabel={true}
                                      compact={true}
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-xs text-center py-2">-</div>
                              )}
                            </TableCell>
                          );
                        })}
                        {showActionsColumn && (
                          <TableCell className="py-3 px-3 text-center align-top w-16">
                            {canRemoveItems && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-destructive hover:text-destructive h-8 w-8 p-0 hover:bg-destructive/10 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-center pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="flex items-center gap-1 h-8 px-3 text-xs border-dashed hover:border-solid transition-all"
              >
                <Plus className="w-3 h-3" />
                Add Another {(title || formatFieldTitle(fieldKey)).slice(0, -1)}
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
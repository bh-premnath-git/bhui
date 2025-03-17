import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { FormField } from './FormField';
import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Node, Edge } from 'reactflow';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useDispatch } from 'react-redux';
// import { generatePipelineAgent } from '@/store/slices/buildPipeLine/BuildPipeLineSlice';
import { AppDispatch } from '@/store';
import { getColumnSuggestions } from '@/lib/pipelineAutoSuggestion';
import { generateInitialValues } from './get-initial-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Schema } from '../../types/formTypes';
import { DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePipelineAgent } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';

type ArraySchema = {
  items: Record<string, any>;
  minItems?: number;
};

interface FormValues extends Record<string, any> {
  derived_fields?: Array<{
    name: string;
    expression: string;
  }>;
  repartition_type?: string;
  repartition_value?: number;
  repartition_expression?: string;
  column_list?: Array<{
    name: string;
    expression: string;
  }>;
}

interface CreateFormProps {
  schema: Schema | null;
  onSubmit: (values: any) => void;
  initialValues?: any;
  nodes: Node[];
  sourceColumns: SourceColumn[];
  onClose?: () => void;
  pipelineDtl?: any;
  currentNodeId: string;
  edges: Edge[];
}

interface SourceColumn {
  name: string;
  dataType: string;
}
const safeArray = (value: any) => Array.isArray(value) ? value : [];


const CreateFormFormik: React.FC<CreateFormProps> = ({ schema, onSubmit, initialValues, nodes, sourceColumns, onClose, pipelineDtl, currentNodeId, edges }) => {
  const initialFormValues:any = useMemo(() => {
    const values = generateInitialValues(schema, initialValues,currentNodeId);
    
    // Add specific initialization for Dedup form
    if (schema?.title === 'Dedup') {
      return {
        keep: 'any',
        dedup_by: [''],
        order_by: [],
        ...values
      };
    }
    
    // Add specific initialization for Repartition form
    if (schema?.title === 'Repartition') {
      return {
        repartition_type: 'repartition',
        repartition_value: '',
        override_partition: '',
        repartition_expression: [],
        limit: '',
        ...values
      };
    }
    
    return values;
  }, [schema, initialValues]);
console.log(initialFormValues,"initialFormValues")
  // Update form configuration to include all fields
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: initialFormValues,
    mode: 'onChange',
  });

  // Watch all form values
  const formValues = watch();


  const dispatch=useDispatch<AppDispatch>();
  const handleExpressionClick = useCallback(async (targetColumn: string, setFieldValue: (field: string, value: any) => void, fieldName: string) => {
    if (!['SchemaTransformation', 'Joiner'].includes(schema?.title || '')) {
      return;
    }
    try {
      const schemaString = sourceColumns.map(col => `${col.name}: ${col.dataType.toLowerCase()}`).join(', ');

      const response: any = await dispatch(generatePipelineAgent({ schemaString, targetColumn })).unwrap();

      if (!response?.result) {
        throw new Error('Invalid response from expression generator');
      }

      const parsedResult = JSON.parse(response.result);
      const expressionValue = parsedResult === "UNABLE_TO_GENERATE" ? '' : parsedResult.expression;
      
      setValue(fieldName, expressionValue, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      setFieldValue(fieldName, expressionValue);
    } catch (error) {
      console.error('Error generating expression:', error);
      setValue(fieldName, '');
      setFieldValue(fieldName, '');
    }
  }, [schema?.title, sourceColumns, setValue, dispatch]);

  // Update onSubmitForm to properly handle nested form values
  const onSubmitForm = (values: FormValues) => {
    console.log('Raw form values before cleaning:', values);

    // Add validation before cleaning
    if (!schema) {
      console.error('Schema is required');
      return;
    }

    // Validate required fields based on schema type
    if (schema.title === 'SchemaTransformation') {
      // Only validate if derived_fields exists and has items
      if (values.derived_fields?.length) {
        // Filter out empty fields first
        const nonEmptyFields = values.derived_fields.filter(
          field => field.name?.trim() || field.expression?.trim()
        );
        
        // If we have any non-empty fields, validate them
        if (nonEmptyFields.length > 0) {
          const invalidFields = nonEmptyFields.filter(
            field => !field.name?.trim() || !field.expression?.trim()
          );
          if (invalidFields.length > 0) {
            console.error('All non-empty derived fields must have both name and expression');
            return;
          }
        }
      }
    }

    const cleanValues = Object.entries(values).reduce((acc, [key, value]) => {
      console.log(`Processing field ${key}:`, { value, type: typeof value });
      
      // Special handling for SchemaTransformation derived_fields
      if (key === 'derived_fields' && Array.isArray(value)) {
        // Filter out items where either name or expression is empty
        const cleanedFields = value.filter(item => 
          item.name?.trim() && item.expression?.trim()
        );
        
        if (cleanedFields.length > 0) {
          acc[key] = cleanedFields;
        }
        return acc;
      }
      
      // Handle other array fields
      if (Array.isArray(value)) {
        // Filter out empty array items
        const cleanedArray = value.filter(item => {
          if (typeof item === 'object') {
            // Check if any property has a non-empty value
            return Object.values(item).some(v => 
              v !== '' && v !== null && v !== undefined && String(v).trim() !== ''
            );
          }
          return item !== '' && item !== null && item !== undefined && String(item).trim() !== '';
        });
        
        if (cleanedArray.length > 0) {
          acc[key] = cleanedArray;
        }
      }
      // Handle object fields
      else if (value !== null && typeof value === 'object') {
        const cleanObj = Object.entries(value).reduce((objAcc, [objKey, objValue]) => {
          if (objValue !== '' && objValue !== null && objValue !== undefined && String(objValue).trim() !== '') {
            objAcc[objKey] = objValue;
          }
          return objAcc;
        }, {} as Record<string, any>);
        
        if (Object.keys(cleanObj).length > 0) {
          acc[key] = cleanObj;
        }
      }
      // Handle primitive values
      else if (value !== undefined && value !== null && value !== '' && String(value).trim() !== '') {
        acc[key] = value;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Update SchemaTransformation validation
    if (schema.title === 'SchemaTransformation') {
      // Only require derived_fields if it's specified as required in the schema
      const isDerivedFieldsRequired = Array.isArray(schema.required) && schema.required.includes('derived_fields');
      if (isDerivedFieldsRequired && (!cleanValues.derived_fields || !cleanValues.derived_fields.length)) {
        console.error('SchemaTransformation requires at least one valid derived field');
        return;
      }
    }

    console.log('Final cleaned values:', cleanValues);
    onSubmit({ ...cleanValues, nodeId: currentNodeId });
  };

  // Add form state debugging
  useEffect(() => {
    console.log('Current Form State:', formValues);
  }, [formValues]);

 

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {/* {schema.title === 'Dedup' && renderDedupFields(control)} */}
      <FormContent
        control={control}
        schema={schema}
        onExpressionClick={handleExpressionClick}
        sourceColumns={sourceColumns}
        onClose={onClose}
        currentNodeId={currentNodeId}
        nodes={nodes}
        edges={edges}
      />
      
      <div className="mt-2">
        <Button
          type="submit"
          variant="default"
          className="w-full"
        >
          Save
        </Button>
      </div>
    </form>
  );
};

const renderArrayFields = (
  arraySchema: ArraySchema,
  control: any,
  section: string,
  onExpressionClick: (targetColumn: string, setFieldValue: (field: string, value: any) => void, fieldName: string) => void,
  sourceColumns: SourceColumn[],
  columnSuggestions: string[]
) => {
  if (!arraySchema || !arraySchema.items) {
    console.warn(`Invalid array schema for section ${section}`);
    return null;
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: section,
    rules: {
      required: arraySchema.minItems ? `Minimum ${arraySchema.minItems} items required` : undefined,
      validate: {
        minItems: (value) => 
          !arraySchema.minItems || (value?.length >= arraySchema.minItems) || 
          `Minimum ${arraySchema.minItems} items required`,
      }
    }
  });

  const itemProperties = arraySchema.items.properties || arraySchema.items;
  const requiredFields = arraySchema.items.required || [];

  return (
    <div>
      <div className="flex gap-2 mb-2">
        {Object.entries(itemProperties).map(([fieldKey, fieldSchema]: [string, any]) => (
          <div key={fieldKey} className="flex-1">
            <div className="mb-1 font-bold">
              {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
              {requiredFields.includes(fieldKey) && 
                <span className="text-red-500"> *</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Array items */}
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 mb-2">
          {Object.entries(itemProperties).map(([fieldKey, fieldSchema]: [string, any]) => {
            const isExpression = fieldSchema?.type === 'expression' ||
              (fieldSchema?.['ui-hint'] === 'expression') ||
              (section === 'expressions' && fieldKey === 'expression') ||
              (fieldKey === 'join_condition');

            // Handle boolean fields
            if (fieldSchema.type === 'boolean') {
              return (
                <Controller
                  key={`${section}.${index}.${fieldKey}`}
                  name={`${section}.${index}.${fieldKey}`}
                  control={control}
                  defaultValue={fieldSchema.default || false}
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">
                        {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </label>
                      <Toggle
                        pressed={value}
                        onPressedChange={onChange}
                        aria-label={fieldKey}
                      >
                        {value ? 'On' : 'Off'}
                      </Toggle>
                    </div>
                  )}
                />
              );
            }

            // Check if the field is pivot_values and render it as an array
            if (fieldKey === 'pivot_values' && fieldSchema.type === 'array') {
              return (
                <div key={`${section}.${index}.${fieldKey}`} className="flex-1">
                  <Controller
                    name={`${section}.${index}.${fieldKey}`}
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <div>
                        {Array.isArray(field.value) ? field.value.map((value: string, valueIndex: number) => (
                          <div key={valueIndex} className="flex items-center gap-2 mb-1">
                            <Input
                              type="text"
                              value={value}
                              onChange={(e) => {
                                const newValue = [...field.value];
                                newValue[valueIndex] = e.target.value;
                                field.onChange(newValue);
                              }}
                              className="form-input"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = field.value.filter((_: string, i: number) => i !== valueIndex);
                                field.onChange(newValue);
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <span className="text-xl">×</span>
                            </button>
                          </div>
                        )) : null}
                        <Button
                          type="button"
                          onClick={() => field.onChange([...field.value, ''])}
                          className="text-green-600 font-bold"
                        >
                          Add Value
                        </Button>
                      </div>
                    )}
                  />
                </div>
              );
            }

            return (
              <Controller
                key={`${section}.${index}.${fieldKey}`}
                name={`${section}.${index}.${fieldKey}`}
                control={control}
                defaultValue={fieldSchema.default || ''}
                rules={{
                  required: requiredFields.includes(fieldKey)
                }}
                render={({ field: { onChange, value, name } }) => (
                  <div className="flex-1">
                    <FormField
                      fieldSchema={{ 
                        type: fieldSchema.type,
                        enum: fieldSchema.enum,
                        title: fieldSchema.title || '',
                        properties: fieldSchema.properties || {}
                      }}
                      name={name}
                      fieldKey={fieldKey}
                      value={value}
                      onChange={(e: any) => {
                        const newValue = e.target?.value ?? e;
                        onChange(newValue);
                      }}
                      isExpression={isExpression}
                      additionalColumns={columnSuggestions.map(colName => ({
                        name: colName,
                        dataType: 'string'
                      }))}
                      sourceColumns={sourceColumns}
                      required={requiredFields.includes(fieldKey)}
                      onExpressionClick={() => onExpressionClick(name || fieldKey, onChange, `${section}.${index}.${fieldKey}`)}
                    />
                  </div>
                )}
              />
            );
          })}
          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length <= (arraySchema.minItems || 1)}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
      ))}

      {/* Add button */}
      <Button
        type="button"
        onClick={() => {
          const emptyItem = Object.keys(itemProperties).reduce(
            (acc, key) => ({
              ...acc,
              [key]: itemProperties[key].enum ?
                (itemProperties[key].default || itemProperties[key].enum[0]) :
                itemProperties[key].type === 'boolean' ? false :
                itemProperties[key].type === 'number' ? 0 : ''
            }),
            {}
          );
          append(emptyItem);
        }}
        className="text-green-600 font-bold"
      >
        Add Field
      </Button>
    </div>
  );
};

const renderDedupFields = (control: any, schema: Schema) => {
  const {watch} = useForm();
  const keepValue = watch('keep');
  const isOrderByRequired = ['first', 'last'].includes(keepValue);

  // Use the hooks instead of components
  const { fields: dedupFields, append: appendDedup, remove: removeDedup } = useFieldArray({
    control,
    name: "dedup_by"
  });

  const { fields: orderFields, append: appendOrder, remove: removeOrder } = useFieldArray({
    control,
    name: "order_by"
  });

  return (
    <div className="space-y-4">
      {/* Keep Field */}
      <Controller
        name="keep"
        control={control}
        defaultValue="any"
        rules={{ required: true }}
        render={({ field }) => (
          <div>
            <label className="block font-medium mb-1">Keep</label>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select keep value" />
              </SelectTrigger>
              <SelectContent>
                {['any', 'first', 'last', 'distinct', 'unique_only'].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

      {/* Dedup By Fields */}
      <div>
        <label className="block font-medium mb-1">
          Dedup By <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {dedupFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Controller
                name={`dedup_by.${index}`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter column name"
                    className="flex-1"
                  />
                )}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeDedup(index)}
                disabled={dedupFields.length <= 1}
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendDedup('')}
            variant="default"
            className="w-full mt-2"
          >
            Add Dedup Column
          </Button>
        </div>
      </div>

      {/* Order By Fields */}
      <div>
        <label className="block font-medium mb-1">
          Order By {isOrderByRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="space-y-2">
          {orderFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Controller
                name={`order_by.${index}.column`}
                control={control}
                rules={{ required: isOrderByRequired }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Column name"
                    className="w-1/2"
                  />
                )}
              />
              <Controller
                name={`order_by.${index}.order`}
                control={control}
                defaultValue="asc"
                rules={{ required: isOrderByRequired }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} >
                    <SelectTrigger className="w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeOrder(index)}
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendOrder({ column: '', order: 'asc' })}
            variant="default"
            className="w-full mt-2"
          >
            Add Order By Column
          </Button>
        </div>
      </div>
    </div>
  );
};

const renderRepartitionFields = (control: any, schema: Schema) => {
  const {watch} = useForm();
  const repartitionType = watch('repartition_type');
  
  // Get required fields based on current repartition_type from schema
  const getRequiredFields = () => {
    const anyOfConditions = schema.anyOf || [];
    const matchingCondition = anyOfConditions.find(condition => 
      condition.if?.properties?.repartition_type?.const === repartitionType
    );
    return matchingCondition?.then?.required || schema.required || [];
  };

  const requiredFields = getRequiredFields();

  // Setup field array for repartition_expression if needed
  const { 
    fields: expressionFields, 
    append: appendExpression, 
    remove: removeExpression 
  } = useFieldArray({
    control,
    name: "repartition_expression"
  });

  // Generic function to render field based on schema
  const renderField = (fieldName: string, fieldSchema: any) => {
    const isRequired = requiredFields.includes(fieldName);

    switch (fieldSchema.type) {
      case 'select':
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue={fieldSchema.default}
            rules={{ required: isRequired }}
            render={({ field }) => (
              <div>
                <label className="block font-medium mb-1">
                  {fieldName.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  {isRequired && <span className="text-red-500">*</span>}
                </label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${fieldName.replace(/_/g, ' ')}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldSchema.enum.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={fieldName}
            control={control}
            rules={{ required: isRequired }}
            render={({ field }) => (
              <div>
                <label className="block font-medium mb-1">
                  {fieldName.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  {isRequired && <span className="text-red-500">*</span>}
                </label>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  placeholder={`Enter ${fieldName.replace(/_/g, ' ')}`}
                  className="w-full"
                />
              </div>
            )}
          />
        );

      case 'string':
        return (
          <Controller
            name={fieldName}
            control={control}
            rules={{ required: isRequired }}
            render={({ field }) => (
              <div>
                <label className="block font-medium mb-1">
                  {fieldName.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  {isRequired && <span className="text-red-500">*</span>}
                </label>
                <Input
                  {...field}
                  placeholder={`Enter ${fieldName.replace(/_/g, ' ')}`}
                  className="w-full"
                />
              </div>
            )}
          />
        );

      case 'array-container':
        if (fieldName === 'repartition_expression') {
          return (
            <div>
              <label className="block font-medium mb-1">
                Repartition Expression
                {isRequired && <span className="text-red-500">*</span>}
              </label>
              <div className="space-y-2">
                {expressionFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    {Object.entries(fieldSchema.items.properties).map(([itemKey, itemSchema]: [string, any]) => (
                      <Controller
                        key={`${fieldName}.${index}.${itemKey}`}
                        name={`${fieldName}.${index}.${itemKey}`}
                        control={control}
                        rules={{ required: fieldSchema.items.required.includes(itemKey) }}
                        render={({ field }) => {
                          if (itemSchema.type === 'select') {
                            return (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder={itemKey} />
                                </SelectTrigger>
                                <SelectContent>
                                  {itemSchema.enum.map((option: string) => (
                                    <SelectItem key={option} value={option}>
                                      {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          }
                          return (
                            <Input
                              {...field}
                              placeholder={itemKey}
                              className={itemKey === 'expression' ? 'flex-1' : 'w-32'}
                            />
                          );
                        }}
                      />
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeExpression(index)}
                      disabled={expressionFields.length <= 1 && isRequired}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => appendExpression(
                    Object.fromEntries(
                      Object.entries(fieldSchema.items.properties).map(([key, schema]: [string, any]) => [
                        key,
                        schema.default || ''
                      ])
                    )
                  )}
                  variant="outline"
                  className="w-full mt-2"
                >
                  Add Expression
                </Button>
              </div>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(schema.properties).map(([fieldName, fieldSchema]: [string, any]) => (
        <div key={fieldName}>
          {renderField(fieldName, fieldSchema)}
        </div>
      ))}
    </div>
  );
};

const FormContent: React.FC<{
  control: any;
  schema: Schema;
  onExpressionClick: (targetColumn: string, setFieldValue: (field: string, value: any) => void, fieldName: string) => void;
  sourceColumns: SourceColumn[];
  onClose?: () => void;
  currentNodeId: string;
  nodes: Node[];
  edges: Edge[]
}> = ({ control, schema, onExpressionClick, sourceColumns, onClose, currentNodeId, nodes, edges }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [columnSuggestions, setColumnSuggestions] = useState<string[]>([]);
  const { watch } = useForm<FormValues>();

  // Update useEffect to use a key to force re-render of FormField components
  const [suggestionKey, setSuggestionKey] = useState(0);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const suggestions = await getColumnSuggestions(currentNodeId, nodes, edges);
        console.log(suggestions,"suggestions")
        setColumnSuggestions(suggestions);
        // Increment key to force re-render of FormField components
        setSuggestionKey(prev => prev + 1);
      } catch (error) {
        console.error('Error getting column suggestions:', error);
        setColumnSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [currentNodeId, nodes, edges]);

  // Add function to check if a field should be rendered based on conditions
  const shouldRenderField = (fieldKey: string, fieldSchema: any) => {
    if (schema.title === 'Dedup') {
      const keepValue = watch('keep');

      // Check if order_by should be rendered based on the value of keep
      if (fieldKey === 'order_by') {
        return ['first', 'last'].includes(keepValue);
      }
    }

    if (schema.title === 'Repartition') {
      const repartitionType = watch('repartition_type');
      
      const matchingCondition = schema.anyOf?.find(condition => 
        condition.if?.properties?.repartition_type?.const === repartitionType
      );

      if (matchingCondition) {
        if (fieldKey === 'repartition_expression') {
          return ['hash_repartition', 'repartition_by_range'].includes(repartitionType);
        }
        if (fieldKey === 'repartition_value') {
          return ['repartition', 'coalesce', 'hash_repartition', 'repartition_by_range'].includes(repartitionType);
        }
      }
    }
    
    return true;
  };

  // Update isFieldRequired function to handle conditional requirements
  const isFieldRequired = (fieldKey: string, fieldSchema?: any, parentKey?: string) => {
    if (schema.title === 'Dedup') {
      const keepValue = watch('keep');

      // Check if order_by is required based on the value of keep
      if (fieldKey === 'order_by' && ['first', 'last'].includes(keepValue)) {
        return true;
      }
    }

    if (schema.title === 'Repartition') {
      const repartitionType = watch('repartition_type') || 'repartition';
      
      // Find the matching condition in the schema
      const matchingCondition = schema.anyOf?.find(condition => 
        condition.if?.properties?.repartition_type?.const === repartitionType
      );

      if (matchingCondition) {
        // Check if the field is required for this repartition type
        const requiredFields = matchingCondition.then?.required || [];
        return requiredFields.includes(fieldKey);
      }

      // Check top-level required fields
      if (Array.isArray(schema.required) && schema.required.includes(fieldKey)) {
        return true;
      }
    }

    // Handle other schema types...
    if (Array.isArray(schema.required) && schema.required.includes(fieldKey)) {
      return true;
    }

    // Check if the parent object has this field as required
    if (parentKey && schema.properties[parentKey]?.required?.includes(fieldKey)) {
      return true;
    }

    // Check nested required fields for objects
    if (fieldSchema?.required && Array.isArray(fieldSchema.required)) {
      return fieldSchema.required.includes(fieldKey);
    }

    return false;
  };

  // Function to render array container fields
  const renderArrayContainer = (fieldKey: string, fieldSchema: any, control: any, parentKey?: string) => {
    const isRequired = isFieldRequired(fieldKey, fieldSchema, parentKey);
    const description = fieldSchema.description;

    const { fields, append, remove } = useFieldArray({
      control,
      name: fieldKey,
    });

    return (
      <div className="mt-2">
        <div className="mb-1 font-bold flex items-center gap-1">
          {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {isRequired && <span className="text-red-500"> *</span>}
          {description && (
            <Tooltip>
              <TooltipTrigger>
                <Info className="text-gray-500 ml-1 cursor-help" style={{ fontSize: 16 }} />
              </TooltipTrigger>
              <TooltipContent>{description}</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Header row */}
        <div className="flex gap-2 mb-2">
          {Object.entries(fieldSchema.items.properties).map(([itemKey, itemSchema]: [string, any]) => (
            <div key={itemKey} className="flex-1">
              <div className="font-bold">
                {itemKey.replace(/_/g, ' ').split(' ').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
                {fieldSchema.items.required?.includes(itemKey) && 
                  <span className="text-red-500"> *</span>}
              </div>
            </div>
          ))}
          <div className="w-10" />
        </div>

        {/* Array items */}
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2">
            {Object.entries(fieldSchema.items.properties).map(([itemKey, itemSchema]: [string, any]) => {
              const isExpression = itemSchema.type === 'expression' || 
                                   itemSchema['ui-hint'] === 'expression' ||
                                   (fieldKey === 'repartition_expression' && itemKey === 'expression');

              return (
                <Controller
                  key={`${fieldKey}.${index}.${itemKey}`}
                  name={`${fieldKey}.${index}.${itemKey}`}
                  control={control}
                  render={({ field }) => (
                    <FormField
                    fieldKey={fieldKey}
                      fieldSchema={{ 
                        type: itemSchema.type,
                        enum: itemSchema.enum,
                        title: itemSchema.title,
                        properties: itemSchema.properties   
                      }}
                      name={`${fieldKey}.${index}.${itemKey}`}
                      value={field.value }
                      isExpression={isExpression}
                      additionalColumns={columnSuggestions.map(colName => ({
                        name: colName,
                        dataType: 'string'
                      }))}
                      sourceColumns={sourceColumns}
                      required={fieldSchema.items.required?.includes(itemKey)}
                      onExpressionClick={() => {
                        if (isExpression) {
                          onExpressionClick(
                            field.name || itemKey,
                            field.onChange,
                            `${fieldKey}.${index}.${itemKey}`
                          );
                        }
                      }}
                    />
                  )}
                />
              );
            })}
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length <= (fieldSchema.minItems || 1)}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        ))}

        {/* Add button */}
        <Button
          type="button"
          onClick={() => {
            const emptyItem = Object.keys(fieldSchema.items.properties).reduce(
              (acc, key) => ({
                ...acc,
                [key]: fieldSchema.items.properties[key].enum ? 
                  (fieldSchema.items.properties[key].default || fieldSchema.items.properties[key].enum[0]) : 
                  fieldSchema.items.properties[key].type === 'number' ? 0 : ''
              }),
              {}
            );
            append(emptyItem);
          }}
          className="text-green-600 font-bold"
        >
          Add Field
        </Button>
      </div>
    );
  };

  // Add specific rendering for Dedupe arrays
  const renderDedupeArrays = (fieldKey: string, fieldSchema: any, control: any) => {
    const isRequired = isFieldRequired(fieldKey);
    
    const { fields, append, remove } = useFieldArray({
      control,
      name: fieldKey,
    });

    return (
      <div className="mt-2">
        <div className="mb-1 font-bold flex items-center gap-1">
          {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {isRequired && <span className="text-red-500">*</span>}
        </div>
        <div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <Controller
                name={`${fieldKey}.${index}`}
                control={control}
                render={({ field }) => (
                  <FormField
                    fieldSchema={{ 
                      type: 'string',
                      title: '',
                      properties: {}
                    }}
                    {...field}
                    required={isRequired}
                    fieldKey={fieldKey}
                  />
                )}
              />
              <button
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          ))}
          <Button
            onClick={() => {
              append('');
            }}
            className="text-green-600 font-bold"
          >
            Add Field
          </Button>
        </div>
      </div>
    );
  };

  // Update renderField to properly handle different field types
  const renderField = (
    fieldKey: string, 
    fieldSchema: Schema, 
    control: any, 
    parentKey?: string
  ) => {
    if (!fieldSchema || typeof fieldSchema !== 'object') {
      console.error(`Invalid schema for field ${fieldKey}`);
      return null;
    }

    const isExpression = fieldSchema.type === 'expression' || 
                        fieldSchema['ui-hint'] === 'expression' ||
                        (fieldKey === 'condition' && fieldSchema.type === 'string') ||
                        (fieldKey === 'sql' && fieldSchema.type === 'string') ||
                        (fieldKey === 'join_condition' && fieldSchema.type === 'string');

    // Special handling for boolean fields
    if (fieldSchema.type === 'boolean') {
      return (
        <Controller
          name={fieldKey}
          control={control}
          defaultValue={fieldSchema.default || false}
          render={({ field: { value, onChange } }) => (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">
                {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </label>
              <Toggle
                pressed={value}
                onPressedChange={onChange}
                aria-label={fieldKey}
              >
                {value ? 'On' : 'Off'}
              </Toggle>
            </div>
          )}
        />
      );
    }

    // Existing rendering logic for other field types
    return (
      <Controller
        name={fieldKey}
        control={control}
        defaultValue={fieldSchema.default || ''}
        rules={{
          required: isFieldRequired(fieldKey, fieldSchema, parentKey)
        }}
        render={({ field: { onChange, value, name } }) => (
          <FormField
            fieldSchema={fieldSchema}
            name={name}
            fieldKey={fieldKey}
            value={value}
            onChange={(e: any) => {
              const newValue = e.target?.value ?? e;
              onChange(newValue);
            }}
            isExpression={isExpression}
            sourceColumns={sourceColumns}
            additionalColumns={columnSuggestions.map(colName => ({
              name: colName,
              dataType: 'string'
            }))}
            required={isFieldRequired(fieldKey, fieldSchema, parentKey)}
            onExpressionClick={() => {
              if (isExpression) {
                onExpressionClick(
                  name || fieldKey,
                  onChange,
                  fieldKey
                );
              }
            }}
          />
        )}
      />
    );
  };

  // Update renderFieldsInRows to handle required fields in tabs
  const renderFieldsInRows = (properties: Record<string, any>, control: any, parentKey?: string) => {
    const fields = Object.entries(properties)
      .filter(([key, value]) => shouldRenderField(key, value));

    let currentRow: [string, any][] = [];
    const rows: [string, any][][] = [];

    fields.forEach(([key, value]) => {
      if (value.type === 'array' || 
          value.type === 'object' || 
          value.type === 'array-container' ||
          value.ui_type === 'full-width') {
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
        rows.push([[key, value]]);
      } else {
        currentRow.push([key, value]);
        if (currentRow.length === 3) {
          rows.push(currentRow);
          currentRow = [];
        }
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows.map((row, rowIndex) => (
      <div 
        key={rowIndex} 
        className="mb-4"
      >
        {row.map(([key, value]) => (
          <div key={key} className="mb-2">
            {renderField(key, value, control, parentKey)}
          </div>
        ))}
        {row.length < 3 && 
         row[0][1].ui_type !== 'full-width' && 
         row[0][1].type !== 'array' && 
         row[0][1].type !== 'object' && 
         row[0][1].type !== 'array-container' && 
         [...Array(3 - row.length)].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
      </div>
    ));
  };

  // Update renderTabContent to pass control
  const renderTabContent = (key: string, value: any, control: any) => {
    if (value.type === 'array') {
      return renderArrayFields(value, control, key, onExpressionClick, sourceColumns, columnSuggestions);
    } else if (value.type === 'object') {
      return renderFieldsInRows(value.properties, control, key);
    } else {
      return renderField(key, value, control, key);
    }
  };

  // Add specific handling for Select node type
  const renderSelectFields = (control: any, sourceColumns: SourceColumn[]) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: "column_list"
    });

    return (
      <div className="space-y-6">
        <div className="mb-4">
          <Controller
            name="transformation"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormField
                fieldSchema={{
                  type: 'string',
                  title: 'Transformation',
                  properties: {}
                }}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                required={true}
                fieldKey="transformation"
              />
            )}
          />
        </div>
        
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <Controller
                name={`column_list.${index}.name`}
                control={control}
                render={({ field }) => (
                  <FormField
                    fieldSchema={{
                      type: 'string',
                      title: 'Column Name',
                      properties: {}
                    }}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    required={true}
                    fieldKey="name"
                  />
                )}
              />
              <Controller
                name={`column_list.${index}.expression`}
                control={control}
                render={({ field }) => (
                  <FormField
                    fieldSchema={{
                      type: 'expression',
                      title: 'Expression',
                      properties: {}
                    }}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    isExpression={true}
                    required={true}
                    fieldKey="expression"
                    sourceColumns={sourceColumns}
                  />
                )}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => append({ name: '', expression: '' })}
            className="text-green-600 font-bold"
          >
            Add Column
          </Button>
        </div>
      </div>
    );
  };

  // Add specific handling for SequenceGenerator
  const renderSequenceGeneratorFields = (control: any, sourceColumns: SourceColumn[], schema: any) => {
    // Helper function to render individual fields based on schema
    const renderSchemaField = (fieldKey: string, fieldSchema: any) => {
      if (fieldSchema.type === 'array-container') {
        const { fields, append, remove } = useFieldArray({
          control,
          name: fieldKey
        });

        return (
          <div className="space-y-4">
            <div className="font-semibold mb-2">
              {fieldKey.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
              {schema.required.includes(fieldKey) && <span className="text-red-500"> *</span>}
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                {Object.entries(fieldSchema.items.properties).map(([itemKey, itemSchema]: [string, any]) => (
                  <Controller
                    key={`${fieldKey}.${index}.${itemKey}`}
                    name={`${fieldKey}.${index}.${itemKey}`}
                    control={control}
                    defaultValue={itemSchema.default || ''}
                    render={({ field }) => (
                      itemSchema.enum ? (
                        <div className="w-32">
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${itemKey}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {itemSchema.enum.map((option: string) => (
                                <SelectItem key={option} value={option}>
                                  {option.charAt(0).toUpperCase() + option.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <FormField
                          fieldSchema={{
                            type: itemSchema.type,
                            title: itemKey,
                            properties: {}
                          }}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          required={schema.required.includes(fieldKey)}
                          fieldKey={itemKey}
                          sourceColumns={sourceColumns}
                        />
                      )
                    )}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={fields.length <= (fieldSchema.minItems || 1)}
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            ))}
            
            <Button
              type="button"
              onClick={() => {
                const defaultValues = Object.fromEntries(
                  Object.entries(fieldSchema.items.properties).map(([key, schema]: [string, any]) => [
                    key,
                    schema.default || (schema.type === 'number' ? 0 : '')
                  ])
                );
                append(defaultValues);
              }}
              className="text-green-600 font-bold"
            >
              Add {fieldKey.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Button>
          </div>
        );
      }

      return (
        <Controller
          name={fieldKey}
          control={control}
          defaultValue={fieldSchema.default || (fieldSchema.type === 'number' ? 0 : '')}
          render={({ field }) => (
            <FormField
              fieldSchema={{
                type: fieldSchema.type,
                title: fieldKey.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                properties: {}
              }}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              required={schema.required.includes(fieldKey)}
              fieldKey={fieldKey}
              sourceColumns={sourceColumns}
            />
          )}
        />
      );
    };

    return (
      <div className="space-y-6">
        {Object.entries(schema.properties)
          .filter(([key]) => !['name', 'transformation'].includes(key))
          .map(([key, value]: [string, any]) => (
            <div key={key}>
              {renderSchemaField(key, value)}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between">
        <DialogTitle className="text-lg font-semibold">
          {schema.title}
        </DialogTitle>
      </div>

      {schema.title === 'Dedup' ? (
        renderDedupFields(control, schema)
      ) : schema.title === 'Select' ? (
        renderSelectFields(control, sourceColumns)
      ) : schema.title === 'SequenceGenerator' ? (
        renderSequenceGeneratorFields(control, sourceColumns, schema)
      ) : schema.ui_type === 'tab-container' ? (
        <Tabs value={activeTab.toString()} onValueChange={(value) => setActiveTab(parseInt(value))}>
          <TabsList>
            {Object.keys(schema.properties).map((key, index) => (
              <TabsTrigger key={key} value={index.toString()}>
                {key.replace(/_/g, ' ').split(' ').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(schema.properties).map(([key, value]: [string, any], index) => (
            <TabsContent key={key} value={index.toString()}>
              {renderTabContent(key, value, control)}
            </TabsContent>
          ))}
        </Tabs>
      ) : schema.ui_type === 'array-container' ? (
        <div className="space-y-2">
          <div>
            {schema.properties?.derived_fields ? renderArrayFields(schema.properties?.derived_fields, control, 'derived_fields', onExpressionClick, sourceColumns, columnSuggestions) : renderArrayFields(schema.properties?.sort_columns, control, 'sort_columns', onExpressionClick, sourceColumns, columnSuggestions)}
          </div>
        </div>
      ) : schema.title === 'Repartition' ? (
        renderRepartitionFields(control, schema)
      ) : (
        <div className="space-y-1">
          {renderFieldsInRows(schema.properties, control)}
        </div>
      )}

      
    </div>
  );
};

export default CreateFormFormik;


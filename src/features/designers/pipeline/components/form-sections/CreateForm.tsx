import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { FormField } from './FormField';
import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Node, Edge } from 'reactflow';
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
import { generateJoinPayload } from '@/lib/pipelineJoinPayload';
import { Autocomplete } from '@/components/ui/autocomplete';

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
  isDialog?: boolean;
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
    
    // Add specific initialization for SchemaTransformation form
    if (schema?.title === 'SchemaTransformation') {
      console.log("Initializing SchemaTransformation form with:", {
        initialValues,
        schema
      });
      
      const schemaFormValues = {
        derived_fields: initialValues?.derived_fields || [{ name: '', expression: '' }],
        dependent_on: initialValues?.dependent_on || [],
        ...values
      };
      
      console.log("Final SchemaTransformation form values:", schemaFormValues);
      return schemaFormValues;
    }
    
    // Add specific initialization for Filter form
    if (schema?.title === 'Filter') {
      return {
        condition: initialValues?.condition || '',
        dependent_on: initialValues?.dependent_on || [],
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
  // Add debounce state and ref
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFields, setGeneratedFields] = useState<Set<string>>(new Set());

  // Add state to track if AI has been attempted for this field
  const [aiAttempted, setAiAttempted] = useState<Set<string>>(new Set());

  // Update handleExpressionClick to only generate once per field
  const handleExpressionClick = useCallback(async (targetColumn: string, setFieldValue: (field: string, value: any) => void, fieldName: string) => {
    if (!['SchemaTransformation', 'Joiner', 'Aggregator'].includes(schema?.title || '') || isGenerating) {
      return;
    }

    // If AI has already been attempted for this field, allow typing
    if (aiAttempted.has(fieldName)) {
      return;
    }

    setIsGenerating(true);
    try {
      if (schema?.title === 'Aggregator') {
        const match = fieldName.match(/aggregations\.(\d+)\.expression/);
        if (match) {
          const index = parseInt(match[1]);
          const aggregations = watch('aggregations');
          const actualTargetColumn = aggregations[index]?.target_column || '';

          if (!actualTargetColumn) {
            console.warn('No target column specified');
            return;
          }

          const suggestions = await getColumnSuggestions(currentNodeId, nodes, edges);
          const schemaString = suggestions.map(col => `${col}:string`).join(', ');

          const response: any = await dispatch(generatePipelineAgent({ 
            params: {
              schema: schemaString,
              target_column: actualTargetColumn
            },
            operation_type: "spark_expression",
            thread_id: 'spark_123'
          })).unwrap();

          if (!response?.result) {
            throw new Error('Invalid response from expression generator');
          }

          try {
            const parsedResult = JSON.parse(response.result);
            
            // Mark this field as having attempted AI generation
            setAiAttempted(prev => new Set(prev).add(fieldName));

            // If UNABLE_TO_GENERATE, just enable typing without setting a value
            if (parsedResult.expression === "UNABLE_TO_GENERATE") {
              const aggregations = [...(watch('aggregations') || [])];
              aggregations[index] = {
                ...aggregations[index],
                expression: ''
              };
              setValue('aggregations', aggregations, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            } else {
              const expressionValue = parsedResult === "" ? '' : parsedResult.expression;
              const aggregations = [...(watch('aggregations') || [])];
              aggregations[index] = {
                ...aggregations[index],
                expression: expressionValue
              };
              setValue('aggregations', aggregations, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            }

            // Focus the input field after AI generation attempt
            const inputElement = document.querySelector(`input[name="aggregations.${index}.expression"]`) as HTMLInputElement;
            if (inputElement) {
              inputElement.focus();
              const length = inputElement.value.length;
              inputElement.setSelectionRange(length, length);
            }
          } catch (error) {
            console.error('Error parsing response:', error);
            throw new Error('Invalid response format from expression generator');
          }
        }
      } else if (schema?.title === 'Joiner') {
        // Check if this is for the expression tab
        if (fieldName.includes('expressions')) {
          const match = fieldName.match(/expressions\.(\d+)\.expression/);
          if (match) {
            const index = parseInt(match[1]);
            const expressions = watch('expressions');
            const actualTargetColumn = expressions[index]?.name || '';

            if (!actualTargetColumn) {
              console.warn('No target column specified');
              return;
            }

            const suggestions = await getColumnSuggestions(currentNodeId, nodes, edges);
            const schemaString = suggestions.map(col => `${col}:string`).join(', ');

            const response: any = await dispatch(generatePipelineAgent({ 
              params: {
                schema: schemaString,
                target_column: actualTargetColumn
              },
              operation_type: "spark_expression",
              thread_id: 'spark_123'
            })).unwrap();

            if (!response?.result) {
              throw new Error('Invalid response from expression generator');
            }

            try {
              const parsedResult = JSON.parse(response.result);
              const expressionValue = parsedResult === "" ? '' : parsedResult.expression=="UNABLE_TO_GENERATE" ? '' : parsedResult.expression;
              
              // Update the expression value in the form
              const expressions = [...(watch('expressions') || [])];
              expressions[index] = {
                ...expressions[index],
                expression: expressionValue
              };
              setValue('expressions', expressions, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });

              // Focus the input field after AI generation
              const inputElement = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
              if (inputElement) {
                inputElement.focus();
                const length = inputElement.value.length;
                inputElement.setSelectionRange(length, length);
              }
            } catch (error) {
              console.error('Error parsing response:', error);
              throw new Error('Invalid response format from expression generator');
            }
          }
        } else {
          // Existing join condition generation logic
          const currentJoinCondition = watch('conditions');
          const match = fieldName.match(/conditions\.(\d+)\.join_condition/);
          const index = match ? parseInt(match[1]) : 0;
          
          if (!currentJoinCondition[index]?.join_condition) {
            const joinPayload: any = await generateJoinPayload(currentNodeId, nodes, edges);
            console.log(joinPayload, "joinPayload");

            const response: any = await dispatch(generatePipelineAgent({ 
              params: joinPayload.params,
              operation_type: "dataset_join",
              thread_id: 'join_123'
            })).unwrap();

            if (!response?.result) {
              throw new Error('Invalid response from expression generator');
            }

            try {
              const parsedResult = JSON.parse(response.result);
              const expressionValue = parsedResult === "" ? '' : parsedResult.expression=="UNABLE_TO_GENERATE" ? '' : parsedResult.expression;
              // Convert join type to expected format (INNER JOIN -> inner, LEFT JOIN -> left)
              const joinType = parsedResult.join_type?.split(' ')[0]?.toLowerCase() || 'left';
              
              console.log(expressionValue, "expressionValue");
              console.log(joinType, "joinType");
              
              // Update the specific condition in the conditions array with both join_condition and join_type
              const updatedConditions = [...(watch('conditions') || [])];
              updatedConditions[index] = {
                ...updatedConditions[index],
                join_condition: expressionValue,
                join_type: joinType
              };
              
              // Set the updated conditions array
              setValue('conditions', updatedConditions, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });

              // Focus the input field after AI generation
              const inputElement = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
              if (inputElement) {
                inputElement.focus();
                const length = inputElement.value.length;
                inputElement.setSelectionRange(length, length);
              }
            } catch (error) {
              console.error('Error parsing response:', error);
              throw new Error('Invalid response format from expression generator');
            }
          }
        }
      } else if (schema?.title === 'SchemaTransformation') {
        // Existing SchemaTransformation logic
        const suggestions = await getColumnSuggestions(currentNodeId, nodes, edges);
        const schemaString = suggestions.map(col => `${col}:string`).join(', ');
        
        const match = fieldName.match(/derived_fields\.(\d+)\.expression/);
        if (match) {
          const index = parseInt(match[1]);
          const derivedFields = watch('derived_fields');
          const actualTargetColumn = derivedFields[index]?.name || '';

          if (!actualTargetColumn) {
            console.warn('No target column specified');
            return;
          }
          const params = {
            schema: schemaString,
            target_column: actualTargetColumn
          };

          const response: any = await dispatch(generatePipelineAgent({ 
            params,
            operation_type:"spark_expression",
            thread_id:'spark_123'
          })).unwrap();

          if (!response?.result) {
            throw new Error('Invalid response from expression generator');
          }

          try {
            const parsedResult = JSON.parse(response.result);
            console.log(parsedResult, "parsedResult");
            const expressionValue = parsedResult === "" ? '' : parsedResult.expression=="UNABLE_TO_GENERATE" ? '' : parsedResult.expression;
            
            // Set the expression value in the form
            const match = fieldName.match(/derived_fields\.(\d+)\.expression/);
            if (match) {
              const index = parseInt(match[1]);
              const derivedFields = [...(watch('derived_fields') || [])];
              derivedFields[index] = {
                ...derivedFields[index],
                expression: expressionValue
              };
              setValue('derived_fields', derivedFields, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            }

            // Mark this field as having been generated
            setGeneratedFields(prev => new Set(prev).add(fieldName));

            // Focus the input field after AI generation
            const inputElement = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
            if (inputElement) {
              inputElement.focus();
              const length = inputElement.value.length;
              inputElement.setSelectionRange(length, length);
            }

          } catch (error) {
            console.error('Error parsing response:', error);
            throw new Error('Invalid response format from expression generator');
          }
        }
      }
    } catch (error) {
      console.error('Error generating expression:', error);
      // Update error handling to include expressions
      if (schema?.title === 'Joiner') {
        if (fieldName.includes('expressions')) {
          const match = fieldName.match(/expressions\.(\d+)\.expression/);
          if (match) {
            const index = parseInt(match[1]);
            const expressions = [...(watch('expressions') || [])];
            expressions[index] = {
              ...expressions[index],
              expression: ''
            };
            setValue('expressions', expressions);
          }
        } else {
          // Existing error handling for join conditions
          const match = fieldName.match(/conditions\.(\d+)\.join_condition/);
          const index = match ? parseInt(match[1]) : 0;
          
          const updatedConditions = [...(watch('conditions') || [])];
          updatedConditions[index] = {
            ...updatedConditions[index],
            join_condition: '',
            join_type: 'left' // Default to left join on error
          };
          setValue('conditions', updatedConditions);
        }
      }
      // Clear the expression field in case of error
      if (schema?.title === 'SchemaTransformation') {
        const match = fieldName.match(/derived_fields\.(\d+)\.expression/);
        if (match) {
          const index = parseInt(match[1]);
          const derivedFields = [...(watch('derived_fields') || [])];
          derivedFields[index] = {
            ...derivedFields[index],
            expression: ''
          };
          setValue('derived_fields', derivedFields);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, [schema?.title, sourceColumns, setValue, dispatch, watch, isGenerating, currentNodeId, nodes, edges]);

  // Reset generated fields when form is reset or component unmounts
  useEffect(() => {
    return () => {
      setGeneratedFields(new Set());
    };
  }, []);

  // Add useEffect to reset aiAttempted when form is reset or component unmounts
  useEffect(() => {
    return () => {
      setAiAttempted(new Set());
    };
  }, []);

  // Add new function to handle tab key press
  const handleExpressionTabPress = useCallback(async (
    event: React.KeyboardEvent,
    targetColumn: string,
    setFieldValue: (field: string, value: any) => void,
    fieldName: string
  ) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      if (!['SchemaTransformation', 'Joiner'].includes(schema?.title || '')) {
        return;
      }

      try {
        const suggestions = await getColumnSuggestions(currentNodeId, nodes, edges);
        const schemaString = suggestions.map(col => `${col}:string`).join(', ');
        
        // Get the actual target column name
        let actualTargetColumn = '';
        
        if (schema?.title === 'SchemaTransformation') {
          const match = fieldName.match(/derived_fields\.(\d+)\.expression/);
          if (match) {
            const index = parseInt(match[1]);
            const derivedFields = watch('derived_fields');
            actualTargetColumn = derivedFields[index]?.name || '';
          }
        } else if (schema?.title === 'Joiner') {
          actualTargetColumn = watch('join_column');
        }

        if (!actualTargetColumn) {
          console.warn('No target column specified');
          return;
        }

        const response: any = await dispatch(generatePipelineAgent({ 
          params: {
            schema: schemaString,
            target_column: actualTargetColumn
          },
          operation_type:"spark_expression",
          thread_id:'spark_123'
        })).unwrap();

        if (!response?.result) {
          throw new Error('Invalid response from expression generator');
        }

        try {
          const parsedResult = JSON.parse(response.result);
          console.log(parsedResult, "parsedResult");
          const expressionValue = parsedResult === "" ? '' : parsedResult.expression=="UNABLE_TO_GENERATE" ? '' : parsedResult.expression;
          
          if (schema?.title === 'SchemaTransformation') {
            const match = fieldName.match(/derived_fields\.(\d+)\.expression/);
            if (match) {
              const index = parseInt(match[1]);
              const derivedFields = [...(watch('derived_fields') || [])];
              derivedFields[index] = {
                ...derivedFields[index],
                expression: expressionValue
              };
              setValue('derived_fields', derivedFields, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            }
          } else if (schema?.title === 'Joiner') {
            setValue('join_condition', expressionValue, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            });
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          throw new Error('Invalid response format from expression generator');
        }
      } catch (error) {
        console.error('Error generating expression:', error);
        // Clear the expression field in case of error
        if (schema?.title === 'SchemaTransformation') {
          const match = fieldName.match(/derived_fields\.(\d+)\.expression/);
          if (match) {
            const index = parseInt(match[1]);
            const derivedFields = [...(watch('derived_fields') || [])];
            derivedFields[index] = {
              ...derivedFields[index],
              expression: ''
            };
            setValue('derived_fields', derivedFields);
          }
        } else if (schema?.title === 'Joiner') {
          setValue('join_condition', '');
        }
      }
    }
  }, [schema?.title, currentNodeId, nodes, edges, dispatch, watch, setValue]);

  // Update onSubmitForm to properly handle nested form values
  const onSubmitForm = (values: FormValues) => {
    console.log('Raw form values before cleaning:', values);

    if (!schema) {
      console.error('Schema is required');
      return;
    }

    // Add specific validation for Joiner
    if (schema.title === 'Joiner') {
      // Validate conditions array
      if (!values.conditions?.length) {
        console.error('At least one join condition is required');
        return;
      }

      // Filter out invalid conditions
      const validConditions = values.conditions.filter(condition => 
        condition.join_condition?.trim() && 
        condition.join_type?.trim()
      );

      if (validConditions.length === 0) {
        console.error('At least one valid join condition is required');
        return;
      }

      // Update the conditions with valid ones
      values.conditions = validConditions;
    }

    const cleanValues = Object.entries(values).reduce((acc, [key, value]) => {
      console.log(`Processing field ${key}:`, { value, type: typeof value });
      
      // Special handling for Joiner conditions
      if (key === 'conditions' && Array.isArray(value)) {
        const cleanedConditions = value.filter(item => 
          item.join_condition?.trim() && 
          item.join_type?.trim()
        );
        
        if (cleanedConditions.length > 0) {
          acc[key] = cleanedConditions;
        }
        return acc;
      }
      
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

    // Additional validation for Joiner
    if (schema.title === 'Joiner' && !cleanValues.conditions?.length) {
      console.error('No valid join conditions found after cleaning');
      return;
    }

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
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
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
      
      <div className="mt-4">
        <Button
          type="submit"
          className="w-full py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
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
  console.log(`Rendering array fields for section: ${section}`, {
    arraySchema,
    control: control ? "Control exists" : "No control",
    section,
    sourceColumns,
    columnSuggestions
  });
  
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
  
  console.log(`Array field properties for ${section}:`, {
    itemProperties,
    requiredFields,
    fields: control._formValues[section]
  });

  return (
    <div className="space-y-4">
      {/* Headers */}
      <div className="flex justify-between gap-2">
        {Object.entries(itemProperties).map(([fieldKey, fieldSchema]: [string, any]) => (
          <div key={fieldKey}>
            <div className="font-medium text-sm text-gray-700">
              {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
              {requiredFields.includes(fieldKey) && 
                <span className="text-red-500 ml-1">*</span>}
            </div>
          </div>
        ))}
        <div /> {/* Spacer for remove button */}
      </div>

      {/* Form Fields */}
      {fields.map((field, index) => (
        <div key={field.id} className="flex justify-between gap-2">
          {Object.entries(itemProperties).map(([itemKey, itemSchema]: [string, any]) => {
            const isExpression = itemSchema.type === 'expression' || 
                               itemSchema['ui-hint'] === 'expression';

            // Handle autocomplete type
            if (itemSchema.type === 'autocomplete') {
              return (
                <div key={`${section}.${index}.${itemKey}`} className="w-full">
                  <Controller
                    name={`${section}.${index}.${itemKey}`}
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        options={columnSuggestions}
                        value={field.value || ''}
                        onChange={field.onChange}
                        renderInput={(params) => (
                          <Input
                            {...params}
                            placeholder={`Enter ${itemKey}`}
                            required={requiredFields.includes(itemKey)}
                          />
                        )}
                        className=""
                        required={requiredFields.includes(itemKey)}
                      />
                    )}
                  />
                </div>
              );
            }

            return (
              <div key={`${section}.${index}.${itemKey}`} className="w-full">
                <Controller
                  name={`${section}.${index}.${itemKey}`}
                  control={control}
                  render={({ field }) => (
                    <FormField
                      fieldKey={itemKey}
                      fieldSchema={{ 
                        type: itemSchema.type,
                        enum: itemSchema.enum,
                        title: itemSchema.title,
                        properties: itemSchema.properties   
                      }}
                      name={`${section}.${index}.${itemKey}`}
                      value={field.value}
                      onChange={field.onChange}
                      isExpression={isExpression}
                      sourceColumns={columnSuggestions.map(colName => ({
                        name: colName,
                        dataType: 'string'
                      }))}
                      required={requiredFields.includes(itemKey)}
                      onExpressionClick={isExpression ? () => {
                        onExpressionClick(
                          field.name || itemKey,
                          field.onChange,
                          `${section}.${index}.${itemKey}`
                        );
                      } : undefined}
                    />
                  )}
                />
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length <= (arraySchema.minItems || 1)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
          >
            <span className="text-gray-500 text-xl">×</span>
          </button>
        </div>
      ))}

      {/* Add Button */}
      <Button
        type="button"
        onClick={() => {
          const emptyItem = Object.keys(itemProperties).reduce(
            (acc, key) => ({
              ...acc,
              [key]: itemProperties[key].enum ? 
                (itemProperties[key].default || itemProperties[key].enum[0]) : ''
            }),
            {}
          );
          append(emptyItem);
        }}
        variant="outline"
        className="w-full mt-4"
      >
        <span className="text-green-600">+ Add Field</span>
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
        console.log('Fetched suggestions:', suggestions); // Add this debug log
        setColumnSuggestions(suggestions);
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
                      fieldKey={itemKey}
                      fieldSchema={{ 
                        type: itemSchema.type,
                        enum: itemSchema.enum,
                        title: itemSchema.title,
                        properties: itemSchema.properties   
                      }}
                      name={`${fieldKey}.${index}.${itemKey}`}
                      value={field.value }
                      isExpression={isExpression}
                      sourceColumns={columnSuggestions.map(colName => ({
                        name: colName,
                        dataType: 'string'
                      }))}
                      // sourceColumns={sourceColumns}
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
                        (fieldKey === 'join_condition' && fieldSchema.type === 'string') ||
                        (parentKey === 'conditions' && fieldKey === 'join_condition');

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
            sourceColumns={columnSuggestions.map(colName => ({
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
            onKeyDown={(e) => {
              if (isExpression) {
                // handleExpressionTabPress(e, name || fieldKey, onChange, fieldKey);
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
  const renderSelectFields = (control: any, sourceColumns: SourceColumn[], schema: Schema) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: "column_list"
    });

    // Get the column list schema properties
    const columnListSchema = schema.properties.column_list;
    const itemProperties = columnListSchema?.items?.properties || {};
    const requiredFields = columnListSchema?.items?.required || [];

    return (
      <div className="space-y-6">
        {/* Render transformation field if it exists in schema */}
        {schema.properties.transformation && (
          <div className="mb-4">
            <Controller
              name="transformation"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormField
                  fieldSchema={schema.properties.transformation}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  fieldKey="transformation"
                />
              )}
            />
          </div>
        )}
        
        {/* Add limit field */}
        <div className="mb-4">
          <Controller
            name="limit"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormField
                fieldSchema={{
                  type: 'number',
                  title: 'Limit',
                  description: 'Maximum number of rows to return',
                  properties: {}
                  // fieldKey: 'limit'
                }}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                fieldKey="limit"
              />
            )}
          />
        </div>
        
        <div className="space-y-4">
          {/* Column headers */}
          <div className="flex gap-2 mb-2">
            {Object.entries(itemProperties).map(([key, value]) => (
              <div key={key} className="flex-1 font-medium">
                {key.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </div>
            ))}
            <div className="w-8"></div>
          </div>

          {/* Column list fields */}
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              {Object.entries(itemProperties).map(([key, fieldSchema]: [string, any]) => (
                <div key={key} className="flex-1">
                  <Controller
                    name={`column_list.${index}.${key}`}
                    control={control}
                    render={({ field }) => (
                      <FormField
                        fieldSchema={{
                          ...fieldSchema,
                          title: key.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')
                        }}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        isExpression={fieldSchema['ui-hint'] === 'expression'}
                        required={requiredFields.includes(key)}
                        fieldKey={key}
                        sourceColumns={sourceColumns}
                      />
                    )}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => remove(index)}
                className="w-8 text-gray-500 hover:text-gray-700 flex items-center justify-center"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          ))}

          {/* Add button */}
          <Button
            type="button"
            onClick={() => {
              const defaultValues = Object.keys(itemProperties).reduce((acc, key) => ({
                ...acc,
                [key]: itemProperties[key].default || ''
              }), {});
              append(defaultValues);
            }}
            className="text-green-600 font-bold w-full"
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
                ...fieldSchema,
                properties: {},
                title: fieldKey.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')
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
        renderSelectFields(control, sourceColumns, schema)
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


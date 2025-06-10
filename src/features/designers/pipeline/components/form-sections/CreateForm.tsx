import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { FormField } from './FormField';
import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Node, Edge } from 'reactflow';
import { useDispatch, useSelector } from 'react-redux';
// import { generatePipelineAgent } from '@/store/slices/buildPipeLine/BuildPipeLineSlice';
import { AppDispatch, RootState } from '@/store';
import { getColumnSuggestions } from '@/lib/pipelineAutoSuggestion';
import { generateInitialValues } from './get-initial-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Schema } from '../../types/formTypes';

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
  repartition_expression?: Array<{
    expression: string;
    sort_order: string;
    order: string;
  }>;
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


const CreateFormFormik: React.FC<CreateFormProps> = ({ schema, onSubmit, initialValues, nodes, sourceColumns, onClose, currentNodeId, edges }) => {
  const initialFormValues:any = useMemo(() => {
    const values = generateInitialValues(schema, initialValues,currentNodeId);
    
    // Add specific initialization for Deduplicator form
    if (schema?.title === 'Deduplicator') {
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
        repartition_expression: initialValues?.repartition_expression || [],
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
    
    // Add specific initialization for Joiner form
    if (schema?.title === 'Joiner') {
      return {
        conditions: initialValues?.conditions || [{ 
          join_type: 'inner', 
          join_condition: '' 
        }],
        dependent_on: initialValues?.dependent_on || [],
        expressions: initialValues?.expressions || [{ 
          name: '', 
          expression: '' 
        }],
        ...values
      };
    }
    
    // Add specific initialization for Set Combiner form (previously Union)
    if (schema?.title === 'Set Combiner') {
      return {
        operation_type: initialValues?.operation_type || 'Union',
        allow_missing_columns: initialValues?.allow_missing_columns || false,
        dependent_on: initialValues?.dependent_on || [],
        ...values
      };
    }
    
    // Add specific initialization for Lookup form
    if (schema?.title === 'Lookup') {
      return {
        lookup_type: initialValues?.lookup_type || 'Column Based',
        lookup_config: initialValues?.lookup_config || { 
          name: '', 
          source: {},
          read_options: {
            header: true
          }
        },
        lookup_data: initialValues?.lookup_data || [
          { id: 1, department: 'Engineering' },
          { id: 2, department: 'Medical' },
          { id: 3, department: 'Arts' },
          { id: 4, department: 'Commerce' },
          { id: 5, department: 'Science' },
          { id: 6, department: 'Mathematics' },
          { id: 7, department: 'Physics' },
          { id: 8, department: 'Chemistry' },
          { id: 9, department: 'Biology' },
          { id: 10, department: 'Geography' }
        ],
        lookup_columns: initialValues?.lookup_columns || [
          { column: 'id', out_column_name: 'id' },
          { column: 'name', out_column_name: 'name' },
          { column: 'department', out_column_name: 'department' },
          { column: 'city', out_column_name: 'city' },
          { column: 'state', out_column_name: 'state' },
          { column: 'zip', out_column_name: 'zip' },
          { column: 'address', out_column_name: 'address' },
          { column: 'age', out_column_name: 'age' }
        ],
        lookup_conditions: initialValues?.lookup_conditions || {
          column_name: 'id',
          lookup_with: 'id'
        },
        keep: initialValues?.keep || 'First',
        ...values
      };
    }
    
    // Add specific initialization for CustomPySpark form
    if (schema?.title === 'CustomPySpark') {
      return {
        user_code: initialValues?.user_code || '',
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
    const {pipelineDtl}= useSelector((state: RootState) => state.buildPipeline);

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

          const suggestions = await getColumnSuggestions(currentNodeId, nodes, edges,pipelineDtl);
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
          console.log(currentNodeId, nodes, edges)
          if (!currentJoinCondition[index]?.join_condition) {
            const joinPayload: any = await generateJoinPayload(currentNodeId, nodes, edges);
            // console.log(joinPayload, "joinPayload");

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

  // Update onSubmitForm to properly handle nested form values
  const onSubmitForm = (values: FormValues) => {
    console.log('Raw form values before cleaning:', values);

    if (!schema) {
      console.error('Schema is required');
      return;
    }

    // Add specific validation for Filter
    if (schema.title === 'Filter') {
      console.log('Processing Filter form with condition:', values.condition);
      // Ensure condition is not undefined
      if (!values.condition) {
        values.condition = '';
      }
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
      
      // Special handling for Aggregator fields
      if (key === 'aggregations' && Array.isArray(value) && schema.title === 'Aggregator') {
        // Filter out items where either target_column or expression is empty
        const cleanedAggregations = value.filter(item => 
          item.target_column?.trim() && item.expression?.trim()
        );
        
        if (cleanedAggregations.length > 0) {
          acc[key] = cleanedAggregations;
        }
        return acc;
      }
      
      // Special handling for group_by in Aggregator
      if (key === 'group_by' && Array.isArray(value) && schema.title === 'Aggregator') {
        // Filter out empty group_by items
        const cleanedGroupBy = value.filter(item => 
          item.group_by?.trim()
        );
        
        if (cleanedGroupBy.length > 0) {
          acc[key] = cleanedGroupBy;
        }
        return acc;
      }
      
      // Special handling for dedup_by in Deduplicator
      if (key === 'dedup_by' && Array.isArray(value) && schema.title === 'Deduplicator') {
        // Filter out empty dedup_by items
        const cleanedDedupBy = value.filter(item => 
          typeof item === 'string' ? item.trim() : item
        );
        
        if (cleanedDedupBy.length > 0) {
          acc[key] = cleanedDedupBy;
        }
        return acc;
      }
      
      // Special handling for order_by in Deduplicator
      if (key === 'order_by' && Array.isArray(value) && schema.title === 'Deduplicator') {
        // Filter out items where column is empty
        const cleanedOrderBy = value.filter(item => 
          item.column?.trim()
        );
        
        if (cleanedOrderBy.length > 0) {
          acc[key] = cleanedOrderBy;
        }
        return acc;
      }
      
      // Special handling for repartition_expression in Repartition
      if (key === 'repartition_expression' && Array.isArray(value) && schema.title === 'Repartition') {
        // Filter out items where expression is empty
        const cleanedExpressions = value.filter(item => 
          item.expression?.trim() && item.sort_order?.trim() && (item.order === 'asc' || item.order === 'desc')
        );
        
        if (cleanedExpressions.length > 0) {
          acc[key] = cleanedExpressions;
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

    // Validate required fields based on schema
    if (Array.isArray(schema.required) && schema.required.length > 0) {
      // Check if all required fields are present in cleanValues
      const missingRequiredFields = schema.required.filter(field => {
        // For array fields, check if they have at least one valid item
        if (Array.isArray(cleanValues[field])) {
          return cleanValues[field].length === 0;
        }
        // For other fields, check if they exist and are not empty
        return !cleanValues[field];
      });

      if (missingRequiredFields.length > 0) {
        console.error(`Missing required fields: ${missingRequiredFields.join(', ')}`);
        return;
      }
    }

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
    
    // Specific validation for Aggregator
    if (schema.title === 'Aggregator') {
      // Check if aggregations array exists and has at least one valid item
      if (!cleanValues.aggregations || !Array.isArray(cleanValues.aggregations) || cleanValues.aggregations.length === 0) {
        console.error('Aggregator requires at least one aggregation');
        return;
      }
      
      // Check if each aggregation has both target_column and expression
      const invalidAggregations = cleanValues.aggregations.filter(agg => 
        !agg.target_column || !agg.expression || 
        agg.target_column.trim() === '' || agg.expression.trim() === ''
      );
      
      if (invalidAggregations.length > 0) {
        console.error('All aggregations must have both target column and expression');
        return;
      }
      
      // Check if group_by array exists and has at least one valid item
      if (!cleanValues.group_by || !Array.isArray(cleanValues.group_by) || cleanValues.group_by.length === 0) {
        console.error('Aggregator requires at least one group by column');
        return;
      }
    }
    
    // Specific validation for Deduplicator
    if (schema.title === 'Deduplicator') {
      // Check if keep is specified
      if (!cleanValues.keep) {
        console.error('Deduplicator requires a keep value');
        return;
      }
      
      // Check if dedup_by array exists and has at least one valid item
      if (!cleanValues.dedup_by || !Array.isArray(cleanValues.dedup_by) || cleanValues.dedup_by.length === 0) {
        console.error('Deduplicator requires at least one column to dedup by');
        return;
      }
      
      // If keep is first or last, order_by is required
      if ((cleanValues.keep === 'first' || cleanValues.keep === 'last') && 
          (!cleanValues.order_by || !Array.isArray(cleanValues.order_by) || cleanValues.order_by.length === 0)) {
        console.error(`Deduplicator with keep=${cleanValues.keep} requires at least one order by column`);
        return;
      }
    }
    
    // Specific validation for Repartition
    if (schema.title === 'Repartition') {
      // Check if repartition_type is specified
      if (!cleanValues.repartition_type) {
        console.error('Repartition requires a repartition type');
        return;
      }
      
      // override_partition is optional, no validation needed
      
      // Validate based on repartition_type
      switch (cleanValues.repartition_type) {
        case 'repartition':
        case 'coalesce':
          // These types require repartition_value
          if (!cleanValues.repartition_value && cleanValues.repartition_value !== 0) {
            console.error(`Repartition type ${cleanValues.repartition_type} requires a repartition value`);
            return;
          }
          break;
          
        case 'hash_repartition':
        case 'repartition_by_range':
          // These types require both repartition_value and repartition_expression
          if (!cleanValues.repartition_value && cleanValues.repartition_value !== 0) {
            console.error(`Repartition type ${cleanValues.repartition_type} requires a repartition value`);
            return;
          }
          
          if (!cleanValues.repartition_expression || !Array.isArray(cleanValues.repartition_expression) || 
              cleanValues.repartition_expression.length === 0) {
            console.error(`Repartition type ${cleanValues.repartition_type} requires at least one repartition expression`);
            return;
          }
          break;
          
        default:
          // Unknown repartition type
          console.error(`Unknown repartition type: ${cleanValues.repartition_type}`);
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
      {/* {schema.title === 'Deduplicator' && renderDeduplicatorFields(control)} */}
      <FormContent
        control={control}
        schema={schema}
        onExpressionClick={handleExpressionClick}
        sourceColumns={sourceColumns}
        onClose={onClose}
        currentNodeId={currentNodeId}
        nodes={nodes}
        edges={edges}
        watch={watch}
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

  // Special handling for the column array structure with column_list
  if (arraySchema.items && arraySchema.items.column_list && arraySchema.items.column_list.type === 'autocomplete') {
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
    
    // Initialize with empty fields if none exist
    useEffect(() => {
      // Only initialize if fields are empty
      if (fields.length === 0) {
        const minItems = arraySchema.minItems || 1; // Default to at least 1 item
        
        // Add initial empty fields based on minItems
        Array.from({ length: minItems }).forEach(() => {
          append({ column_list: '' });
        });
      }
    }, []);

    return (
      <div className="space-y-4">
        <label className="block font-medium mb-1">
          {section.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {arraySchema.minItems && arraySchema.minItems > 0 && <span className="text-red-500">*</span>}
        </label>
        
        {/* Form Fields */}
        {fields.map((field, index) => (
          <div key={field.id} className="flex justify-between gap-2 mb-2">
            <div className="w-full">
              <Controller
                name={`${section}.${index}.column_list`}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={columnSuggestions}
                    value={field.value || ''}
                    onChange={field.onChange}
                    renderInput={(params) => (
                      <Input
                        {...params}
                        placeholder="Select column"
                        required={arraySchema.minItems && arraySchema.minItems > 0}
                      />
                    )}
                    className=""
                    required={arraySchema.minItems && arraySchema.minItems > 0}
                  />
                )}
              />
            </div>
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
            append({ column_list: '' });
          }}
          variant="outline"
          className="w-full"
        >
          <span className="text-green-600">+ Add Column</span>
        </Button>
      </div>
    );
  }

  // Standard array field handling
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
  
  // Initialize with empty fields if none exist
  useEffect(() => {
    // Only initialize if fields are empty
    if (fields.length === 0) {
      const itemProperties = arraySchema.items.properties || arraySchema.items;
      const emptyItem = Object.keys(itemProperties).reduce(
        (acc, key) => ({
          ...acc,
          [key]: itemProperties[key].enum ? 
            (itemProperties[key].default || itemProperties[key].enum[0]) : ''
        }),
        {}
      );
      
      const minItems = arraySchema.minItems || 1; // Default to at least 1 item
      
      // Add initial empty fields based on minItems
      Array.from({ length: minItems }).forEach(() => {
        append(emptyItem);
      });
    }
  }, []);

  const itemProperties = arraySchema.items.properties || arraySchema.items;
  const requiredFields = arraySchema.items.required || [];
  
  console.log(`Array field properties for ${section}:`, {
    itemProperties,
    requiredFields,
    fields: control._formValues[section]
  });

  return (
    <div className="space-y-4">
      {/* <label className="block font-medium mb-1">
        {section.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
        {arraySchema.minItems && arraySchema.minItems > 0 && <span className="text-red-500">*</span>}
      </label> */}
      
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
                            placeholder={`Enter ${itemKey.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`}
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

const renderDeduplicatorFields = (control: any, schema: Schema) => {
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

      {/* Deduplicator By Fields */}
      <div>
        <label className="block font-medium mb-1">
          Deduplicator By <span className="text-red-500">*</span>
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


const FormContent: React.FC<{
  control: any;
  schema: Schema;
  onExpressionClick: (targetColumn: string, setFieldValue: (field: string, value: any) => void, fieldName: string) => void;
  sourceColumns: SourceColumn[];
  onClose?: () => void;
  currentNodeId: string;
  nodes: Node[];
  edges: Edge[];
  watch: any; // Add watch function as a prop
}> = ({ control, schema, onExpressionClick, sourceColumns, onClose, currentNodeId, nodes, edges, watch }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [columnSuggestions, setColumnSuggestions] = useState<string[]>([]);

  // Update useEffect to use a key to force re-render of FormField components
  const [suggestionKey, setSuggestionKey] = useState(0);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        console.log(currentNodeId, nodes, edges);
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

  // Update renderField to properly handle different field types
  const renderField = (
    fieldKey: string, 
    fieldSchema: any, 
    control: any, 
    parentKey?: string
  ) => {
    if (!fieldSchema || typeof fieldSchema !== 'object') {
      console.error(`Invalid schema for field ${fieldKey}`);
      return null;
    }

    // Special handling for array type with nested structure
    if (fieldSchema.type === 'array') {
      // Check if this is a special case with column_list structure
      if (fieldSchema.items && fieldSchema.items.column_list && fieldSchema.items.column_list.type === 'autocomplete') {
        return renderArrayFields(fieldSchema, control, fieldKey, onExpressionClick, sourceColumns, columnSuggestions);
      }
      
      // For other array types, use the standard array rendering
      return renderArrayFields(fieldSchema, control, fieldKey, onExpressionClick, sourceColumns, columnSuggestions);
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
    console.log(fields)
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
        {row.map(([key, value]) => {
          // Special handling for array type with nested structure like column_list
          if (value.type === 'array' && value.items && value.items.column_list && value.items.column_list.type === 'autocomplete') {
            return (
              <div key={key} className="mb-2">
                {renderArrayFields(value, control, key, onExpressionClick, sourceColumns, columnSuggestions)}
              </div>
            );
          }
          
          return (
            <div key={key} className="mb-2">
              {renderField(key, value, control, parentKey)}
            </div>
          );
        })}
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
        <h2 className="text-lg font-semibold">
          {schema.title}
        </h2>
      </div>

      {schema.title === 'Dedup' || schema.title === 'Deduplicator' ? (
        renderDeduplicatorFields(control, schema)
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
        <div className="space-y-4">
          {(() => {
            // Setup useFieldArray for repartition_expression
            const { 
              fields: expressionFields, 
              append: appendExpression, 
              remove: removeExpression 
            } = useFieldArray({
              control,
              name: "repartition_expression"
            });
            
            // Initialize expression fields when needed
            useEffect(() => {
              const currentType = watch('repartition_type');
              if (['hash_repartition', 'repartition_by_range'].includes(currentType) && 
                  (!expressionFields || expressionFields.length === 0)) {
                appendExpression({
                  expression: '',
                  sort_order: '',
                  order: 'asc'
                });
              }
            }, [watch('repartition_type'), expressionFields.length, appendExpression]);
            
            return (
              <>
                {/* Repartition Type */}
                <div>
                  <Controller
                    name="repartition_type"
                    control={control}
                    defaultValue="repartition"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <div>
                        <label className="block font-medium mb-1">
                          Repartition Type<span className="text-red-500">*</span>
                        </label>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select repartition type" />
                          </SelectTrigger>
                          <SelectContent>
                            {schema.properties.repartition_type.enum.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                </div>

                {/* Repartition Value */}
                <div>
                  <Controller
                    name="repartition_value"
                    control={control}
                    rules={{ 
                      required: ['repartition', 'coalesce', 'hash_repartition', 'repartition_by_range'].includes(watch('repartition_type')) 
                    }}
                    render={({ field }) => (
                      <div>
                        <label className="block font-medium mb-1">
                          Repartition Value
                          {['repartition', 'coalesce', 'hash_repartition', 'repartition_by_range'].includes(watch('repartition_type')) && 
                            <span className="text-red-500">*</span>
                          }
                        </label>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                          placeholder="Enter repartition value"
                          className="w-full"
                        />
                      </div>
                    )}
                  />
                </div>

                {/* Override Partition */}
                <div>
                  <Controller
                    name="override_partition"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block font-medium mb-1">
                          Override Partition
                        </label>
                        <Input
                          {...field}
                          placeholder="Enter override partition"
                          className="w-full"
                        />
                      </div>
                    )}
                  />
                </div>

                {/* Limit */}
                <div>
                  <Controller
                    name="limit"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block font-medium mb-1">Limit</label>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                          placeholder="Enter limit"
                          className="w-full"
                        />
                      </div>
                    )}
                  />
                </div>

                {/* Repartition Expression */}
                {['hash_repartition', 'repartition_by_range'].includes(watch('repartition_type')) && (
                  <div>
                    <label className="block font-medium mb-1">
                      Repartition Expression<span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {expressionFields.map((item, index) => (
                        <div key={item.id} className="flex gap-2">
                          {/* Expression */}
                          <Controller
                            name={`repartition_expression.${index}.expression`}
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Expression"
                                className="flex-1"
                              />
                            )}
                          />
                          
                          {/* Sort Order */}
                          <Controller
                            name={`repartition_expression.${index}.sort_order`}
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder="Sort Order"
                                className="w-32"
                              />
                            )}
                          />
                          
                          {/* Order */}
                          <Controller
                            name={`repartition_expression.${index}.order`}
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Order" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="asc">Ascending</SelectItem>
                                  <SelectItem value="desc">Descending</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          
                          {/* Remove Button */}
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeExpression(index)}
                            disabled={expressionFields.length <= 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      
                      {/* Add Button */}
                      <Button
                        type="button"
                        onClick={() => appendExpression({
                          expression: '',
                          sort_order: '',
                          order: 'asc'
                        })}
                        variant="outline"
                        className="w-full mt-2"
                      >
                        Add Expression
                      </Button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        <div className="space-y-1">
          {renderFieldsInRows(schema.properties, control)}
        </div>
      )}

      
    </div>
  );
};

export default CreateFormFormik;

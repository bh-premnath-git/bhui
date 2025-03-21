// src/utils/generateInitialValues.ts

import { ArraySchema, Schema } from "../../types/formTypes";
import { FormValues } from "../schema";



export const generateInitialValues = (schema: Schema | null, initialValues: any, currentNodeId: string): FormValues => {
  if (!schema) {
    return {};
  }

  // Always create a fresh copy of initial values for this specific node
  const baseValues = {
    nodeId: currentNodeId,
    ...(initialValues || {}) // Handle case where initialValues is null/undefined
  };
console.log(baseValues,"baseValues")
console.log(initialValues,"initialValues")
  switch (schema.title) {
    case 'Sorter':
      return {
        ...baseValues,
        sort_columns: (baseValues.sort_columns?.length > 0) 
          ? baseValues.sort_columns
          : [{
              column: '',
              order: 'asc'
            }]
      };

    case 'Filter':
      return {
        ...baseValues,
        condition: initialValues.condition || ''
      };

    case 'Aggregator':
      console.log(baseValues)
      console.log(baseValues.group_by)
      console.log(baseValues.aggregate)
      return {
        ...baseValues,
        group_by: baseValues.group_by.map(item=>{return {group_by:item}}) || [],
        aggregations: (baseValues.aggregate?.length > 0)
          ? baseValues.aggregate
          : [],
        pivot_by: baseValues.pivot || []
      };

    case 'SchemaTransformation':
      return {
        ...baseValues,
        derived_fields: (baseValues.derived_fields?.length > 0)
          ? baseValues.derived_fields
          : [{
              name: '',
              expression: ''
            }]
      };

      case 'Joiner':
        console.log('Joiner initial values:', initialValues);
        return {
          ...baseValues,
          conditions: Array.isArray(initialValues?.conditions) && initialValues.conditions.length > 0
            ? initialValues.conditions.map(condition => ({
                join_condition: condition.join_condition || '',
                join_type: condition.join_type || 'left',
                join_input: condition.join_input || ''
              }))
            : [{
                join_condition: '',
                join_type: 'left',
                join_input: ''
              }],
          expressions: Array.isArray(initialValues?.expressions) && initialValues.expressions.length > 0
            ? initialValues.expressions.map(expr => ({
                name: expr?.target_column ?? expr?.name ?? '',
                expression: expr?.expression ?? ''
              }))
            : [{
                name: '',
                expression: ''
              }],
          advanced: {
            hints: Array.isArray(initialValues?.advanced?.hints) && initialValues.advanced.hints.length > 0
              ? initialValues.advanced.hints.map(hint => ({
                  hint: hint || ''
                }))
              : [{
                  hint: ''
                }],
            broadcast_hint: initialValues?.advanced?.broadcast_hint ?? false,
            partition_keys: Array.isArray(initialValues?.advanced?.partition_keys)
              ? initialValues.advanced.partition_keys
              : [],
            sort_keys: Array.isArray(initialValues?.advanced?.sort_keys)
              ? initialValues.advanced.sort_keys
              : []
          }
        };

    case 'Repartition':
      return {
        ...baseValues,
        repartition_type: initialValues?.repartition_type || 'repartition',
        repartition_value: initialValues?.repartition_value || '',
        override_partition: initialValues?.override_partition || '',
        repartition_expression: initialValues?.repartition_expression || [{
          expression: '',
          sort_order: '',
          order: 0
        }],
        limit: initialValues?.limit || ''
      };

    case 'Lookup':
      return {
        ...baseValues,
        lookup_name: initialValues?.lookup_name || '',
        lookup_table: initialValues?.lookup_table || '',
        lookup_columns: initialValues?.lookup_columns || [{
          source_column: '',
          lookup_column: '',
          output_column: ''
        }],
        lookup_conditions: initialValues?.lookup_conditions || [{
          source_column: '',
          lookup_column: '',
          operator: '='
        }],
        broadcast_hint: initialValues?.broadcast_hint || false
      };

    case 'Select':
      return {
        ...baseValues,
        transformation: initialValues?.transformation || '',
        column_list: Array.isArray(initialValues?.column_list) && initialValues.column_list.length > 0
          ? initialValues.column_list.map((col: any) => ({
              name: col?.name || '',
              expression: col?.expression || ''
            }))
          : [{
              name: '',
              expression: ''
            }]
      };

    case 'SequenceGenerator':
      return {
        ...baseValues,
        for_column_name: initialValues.for_column_name || '',
        order_by: initialValues.order_by || [],
        start_with: initialValues.start_with || 1,
        step: initialValues.step || ''
      };

    case 'Drop':
      return {
        ...baseValues,
        transformation: initialValues.transformation || '',
        column_list: initialValues.column_list?.map((col: any) => ({
          column: col?.column || ''
        })) || [{
          column: ''
        }],
        limit: initialValues.limit || ''
      };

    case 'Dedup':
      return {
        ...baseValues,
        keep: initialValues.keep || "any",
        dedup_by: initialValues.dedup_by || [],
        order_by: initialValues.order_by || []
      };

    default:
      return baseValues;
  }
};


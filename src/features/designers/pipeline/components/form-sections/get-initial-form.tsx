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
      return {
        ...baseValues,
        group_by: baseValues.group_by || [],
        aggregations: (baseValues.aggregations?.length > 0)
          ? baseValues.aggregations
          : [{
              column: '',
              function: '',
              alias: ''
            }],
        pivot_by: baseValues.pivot_by || []
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
      return {
        ...baseValues,
        conditions: initialValues.conditions || [{
          join_input: '',
          join_condition: '',
          join_type: 'left'
        }],
        expressions: initialValues.expressions?.map((expr: any) => ({
          name: expr?.target_column || '',
          expression: expr?.expression || ''
        })) || [{
          name: '',
          expression: ''
        }],
        advanced: initialValues.advanced?.hints || [{
          join_input: '',
          hint_type: 'broadcast'
        }]
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


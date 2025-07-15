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
        condition: baseValues.condition || initialValues?.condition || ''
      };

    case 'Aggregator':
      // Debug logs
      console.log('Raw baseValues:', baseValues);
      console.log('Raw group_by:', baseValues.group_by);
      console.log("initialValues", initialValues);

      // Enhanced normalization logic
      const normalizedGroupBy = Array.isArray(baseValues.group_by)
        ? baseValues.group_by
        : Array.isArray(initialValues?.group_by)
          ? initialValues.group_by
          : [];
      
      console.log('Normalized group_by:', normalizedGroupBy);

      return {
        ...baseValues,
        group_by: normalizedGroupBy,
        aggregations: (baseValues.aggregations?.length > 0)
          ? baseValues.aggregations
          : (initialValues?.aggregate?.length > 0)
            ? initialValues.aggregate.map((agg: any) => ({
                target_column: agg.target_column || '',
                expression: agg.expression || '',
                alias: agg.alias || ''
              }))
            : [{
                target_column: '',
                expression: '',
                alias: ''
              }],
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
            }],
        select_columns: baseValues.select_columns || [],
        drop_columns: baseValues.drop_columns || [],
        rename_columns: baseValues.rename_columns || {}
      };

    case 'Reader':
      return {
        ...baseValues,
        reader_name: baseValues.reader_name || '',
        source: baseValues.source || {},
        select_columns: baseValues.select_columns || [],
        drop_columns: baseValues.drop_columns || [],
        rename_columns: baseValues.rename_columns || {}
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
          sort_order: 'asc'
        }],
        limit: initialValues?.limit || ''
      };

    case 'Lookup':
      return {
        ...baseValues,
        lookup_type: initialValues?.lookup_type || 'Column Based',
        lookup_config: initialValues?.lookup_config || { 
          name: '', 
          source: {},
          read_options: {
            header: true
          }
        },
        lookup_data: initialValues?.lookup_data || [],
        lookup_columns: Array.isArray(initialValues?.lookup_columns) ? initialValues.lookup_columns : [],
        lookup_conditions: initialValues?.lookup_conditions || {
          column_name: 'id',
          lookup_with: 'id'
        },
        keep: initialValues?.keep || 'First'
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
            }],
        limit: initialValues?.limit || ''
      };

    case 'SequenceGenerator':
      return {
        ...baseValues,
        transformation: 'sequence_generator',
        for_column_name: initialValues.for_column_name || '',
        order_by: initialValues.order_by || [{ column: '', order: 'asc' }],
        start_with: initialValues.start_with || 1,
        step: initialValues.step || 1
      };

    case 'Drop':
      console.log(initialValues,'drop')
      
      // Extract column_list based on the input format
      let columnList = [];
      
      // Case 1: If column_list is directly available as an array of strings
      if (Array.isArray(initialValues.column_list)) {
        // If it's already an array of strings, use it directly
        columnList = initialValues.column_list;
      } 
      // Case 2: If column is an array with column_list property that is an array
      else if (Array.isArray(initialValues.column) && initialValues.column.length > 0 && 
               Array.isArray(initialValues.column[0]?.column_list)) {
        columnList = initialValues.column[0].column_list;
      }
      // Case 3: If column is an array with column_list properties as strings
      else if (Array.isArray(initialValues.column)) {
        columnList = initialValues.column
          .map(item => item.column_list)
          .filter(item => item); // Filter out undefined/null values
      }
      
      return {
        ...baseValues,
        transformation: initialValues.transformation || '',
        column_list: columnList.length > 0 ? columnList : [],
        pattern: initialValues.pattern || '',
      };

    case 'Deduplicator':
      return {
        ...baseValues,
        keep: initialValues.keep || "any",
        dedup_by: initialValues.dedup_by || [],
        order_by: initialValues.order_by || []
      };

    case 'DQCheck':
      return {
        ...baseValues,
        dq_rules: Array.isArray(initialValues?.dq_rules) && initialValues.dq_rules.length > 0
          ? initialValues.dq_rules.map(rule => ({
              rule_name: rule.rule_name || '',
              column: rule.column || '',
              rule_type: rule.rule_type || '',
              value: rule.value || '',
              value2: rule.value2 || '',
              action: rule.action || 'warning'
            }))
          : [{
              rule_name: '',
              column: '',
              rule_type: '',
              value: '',
              value2: '',
              action: 'warning'
            }]
      };

    default:
      return baseValues;
  }
};


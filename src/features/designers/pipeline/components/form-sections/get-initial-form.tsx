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
        reader_name: baseValues.reader_name || initialValues?.reader_name || '',
        name: baseValues.name || initialValues?.name || baseValues.reader_name || '',
        source: baseValues.source || initialValues?.source || {},
        read_options: baseValues.read_options || initialValues?.read_options || { header: true },
        select_columns: baseValues.select_columns || initialValues?.select_columns || [],
        drop_columns: baseValues.drop_columns || initialValues?.drop_columns || [],
        rename_columns: baseValues.rename_columns || initialValues?.rename_columns || {}
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
          column_name: '',
          lookup_with: ''
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

    case 'Sequence':
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
        transformation: initialValues?.transformation || 'DQCheck',
        name: initialValues?.name || '',
        limit: initialValues?.limit || undefined,
        dq_rules: Array.isArray(initialValues?.dq_rules) && initialValues.dq_rules.length > 0
          ? initialValues.dq_rules.map(rule => ({
              rule_name: rule.rule_name || '',
              column: rule.column || '',
              column_type: rule.column_type || 'string',
              rule_type: rule.rule_type || '',
              value: rule.value || '',
              value2: rule.value2 || undefined,
              action: rule.action || 'warning'
            }))
          : [{
              rule_name: '',
              column: '',
              column_type: 'string',
              rule_type: '',
              value: '',
              value2: undefined,
              action: 'warning'
            }],
        dependent_on: initialValues?.dependent_on || []
      };

    case 'Mapper':
      return {
        ...baseValues,
        derived_fields: Array.isArray(initialValues?.derived_fields) && initialValues.derived_fields.length > 0
          ? initialValues.derived_fields.map((field: any) => ({
              name: field?.name || '',
              expression: field?.expression || ''
            }))
          : [{
              name: '',
              expression: ''
            }],
        select_columns: Array.isArray(initialValues?.select_columns) 
          ? initialValues.select_columns.filter((col: any) => 
              col !== null && col !== undefined && col !== ''
            )
          : [],
        drop_columns: Array.isArray(initialValues?.drop_columns) 
          ? initialValues.drop_columns.filter((col: any) => 
              col !== null && col !== undefined && col !== ''
            )
          : [],
        rename_columns: initialValues?.rename_columns && typeof initialValues.rename_columns === 'object'
          ? initialValues.rename_columns
          : {},
        column_list: Array.isArray(initialValues?.column_list) 
          ? initialValues.column_list.filter((col: any) => 
              col !== null && col !== undefined && col !== ''
            )
          : []
      };

    case 'Target':
    case 'Writer':
      // Handle both resolved and unresolved target data
      // Data can be in different structures:
      // 1. initialValues.target (nested structure from form states)
      // 2. initialValues directly (flat structure from transformationData)
      const targetData = initialValues?.target || {};
      const connectionData = targetData?.connection || {};
      
      console.log('🔧 generateInitialValues - Target/Writer case:', {
        initialValues,
        targetData,
        connectionData,
        hasNestedTarget: !!initialValues?.target,
        hasFlatStructure: !initialValues?.target && (initialValues?.target_type || initialValues?.target_name)
      });
      
      // Handle flat structure (from transformationData) vs nested structure (from form states)
      const resolvedTargetData = {
        target_type: targetData?.target_type || initialValues?.target_type || 'File',
        target_name: targetData?.target_name || initialValues?.target_name || '',
        table_name: targetData?.table_name || initialValues?.table_name || '',
        file_name: targetData?.file_name || initialValues?.file_name || '',
        load_mode: targetData?.load_mode || initialValues?.load_mode || 'append',
        connection: {
          ...connectionData,
          // Also check for connection at root level
          ...(initialValues?.connection || {}),
          // Ensure connection_config_id is available for form validation
          // Handle $ref format (e.g., "#/connections/output.csv") by extracting the connection name
          connection_config_id: connectionData?.connection_config_id || 
                               connectionData?.id || 
                               initialValues?.connection?.connection_config_id ||
                               initialValues?.connection?.id ||
                               initialValues?.connection_config_id ||
                               // Handle $ref format by extracting the connection name
                               (connectionData?.$ref ? connectionData.$ref.split('/').pop() : null) ||
                               (initialValues?.connection?.$ref ? initialValues.connection.$ref.split('/').pop() : null)
        }
      };
      
      console.log('🔧 generateInitialValues - Connection resolution details:', {
        connectionData,
        rootConnection: initialValues?.connection,
        rootConnectionConfigId: initialValues?.connection_config_id,
        resolvedConnectionConfigId: resolvedTargetData.connection.connection_config_id,
        allConnectionSources: {
          'connectionData.connection_config_id': connectionData?.connection_config_id,
          'connectionData.id': connectionData?.id,
          'initialValues.connection.connection_config_id': initialValues?.connection?.connection_config_id,
          'initialValues.connection.id': initialValues?.connection?.id,
          'initialValues.connection_config_id': initialValues?.connection_config_id
        }
      });
      
      // Normalize file_type to uppercase for consistency
      const rawFileType = initialValues?.file_type || targetData?.file_type || 'CSV';
      const normalizedFileType = typeof rawFileType === 'string' ? rawFileType.toUpperCase() : 'CSV';
      
      const result = {
        ...baseValues,
        name: "output", // Always use "output" for target nodes
        target: resolvedTargetData,
        file_type: normalizedFileType,
        write_options: initialValues?.write_options || {
          header: true,
          sep: ","
        }
      };
      
      console.log('🔧 generateInitialValues - Target/Writer result:', result);
      return result;

    default:
      return baseValues;
  }
};


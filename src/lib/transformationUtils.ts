import { pipelineSchema, flowSchema } from "@bh-ai/schemas";

interface TransformationConfig {
    name: string;
    [key: string]: any;
}

export const getInitialFormState = (
    transformation: TransformationConfig,
    matchingNodeId: string
): { [key: string]: any } => {
    if (!matchingNodeId) return {};

    const baseState = {
        name: transformation.name
    };

    switch (transformation.transformation) {
        case 'Joiner':
            return {
                ...baseState,
                conditions: transformation.conditions || [],
                expressions: transformation.expressions || [],
                advanced: transformation.advanced || []
            };

        case 'SchemaTransformation':
            return {
                ...baseState,
                derived_fields: transformation.derived_fields || []
            };

        case 'Sorter':
            return {
                ...baseState,
                sort_columns: transformation.sort_columns || []
            };

        case 'Aggregator':
            return {
                ...baseState,
                group_by: transformation.group_by || [],
                aggregate: transformation.aggregations || [],
                pivot: transformation.pivot_by || []
            };

        case 'Filter':
            return {
                ...baseState,
                condition: transformation.condition || ''
            };

        case 'Repartition':
            return {
                ...baseState,
                repartition_type: transformation.repartition_type || 'repartition',
                repartition_value: transformation.repartition_value || '',
                override_partition: transformation.override_partition || '',
                repartition_expression: transformation.repartition_expression || [{
                    expression: '',
                    sort_order: '',
                    order: 0
                }],
                limit: transformation.limit || ''
            };

        case 'Lookup':
            // Handle lookup_conditions - convert array back to single object for UI
            let lookupConditions = {
                column_name: '',
                lookup_with: ''
            };
            
            if (Array.isArray(transformation.lookup_conditions) && transformation.lookup_conditions.length > 0) {
                // If it's an array, take the first valid condition
                const firstCondition = transformation.lookup_conditions[0];
                if (firstCondition && (firstCondition.column_name || firstCondition.lookup_with)) {
                    lookupConditions = firstCondition;
                }
            } else if (transformation.lookup_conditions && typeof transformation.lookup_conditions === 'object') {
                // If it's already a single object, use it
                lookupConditions = transformation.lookup_conditions;
            }
            
            return {
                ...baseState,
                lookup_type: transformation.lookup_type || 'Column Based',
                lookup_config: transformation.lookup_config || { 
                    name: '', 
                    source: {},
                    read_options: {
                        header: true
                    }
                },
                lookup_data: transformation.lookup_data ,
                lookup_columns: transformation.lookup_columns ,
                lookup_conditions: lookupConditions,
                keep: transformation.keep || 'First'
            };

        case 'Deduplicator':
            return {
                ...baseState,
                keep: transformation.keep || "any",
                dedup_by: transformation.dedup_by || [],
                order_by: transformation.order_by || []
            };

        case 'Sequence':
            return {
                ...baseState,
                for_column_name: transformation.for_column_name || '',
                order_by: transformation.order_by || [],
                start_with: transformation.start_with || 1,
                step: transformation.step || ''
            };

        case 'Drop':
            return {
                ...baseState,
                column_list: transformation.column_list || [],
                pattern: transformation.pattern || '',
                transformation: transformation.transformation || ''
            };
            
        case 'Set Combiner':
            return {
                ...baseState,
                operation_type: transformation.operation_type || 'Union',
                allow_missing_columns: transformation.allow_missing_columns || false
            };
            
        case 'CustomPySpark':
            return {
                ...baseState,
                user_code: transformation.user_code || ''
            };

        case 'Select':
            return {
                ...baseState,
                column_list: transformation.column_list?.map((col: any) => ({
                    name: col.name || '',
                    expression: col.expression || ''
                })) || [],
                transformation: transformation.transformation || ''
            };
        
        case 'Mapper':
            return {
                ...baseState,
                derived_fields: Array.isArray(transformation.derived_fields) 
                    ? transformation.derived_fields.map((field: any) => ({
                        name: field.name || '',
                        expression: field.expression || ''
                    }))
                    : [{ name: '', expression: '' }],
                select_columns: Array.isArray(transformation.select_columns) 
                    ? transformation.select_columns.filter((col: any) => 
                        col !== null && col !== undefined && col !== ''
                    )
                    : [],
                column_list: Array.isArray(transformation.column_list) 
                    ? transformation.column_list.filter((col: any) => 
                        col !== null && col !== undefined && col !== ''
                    )
                    : []
            };

        default:
            return transformation.name ? {
                ...transformation,
                name: transformation.name
            } : {};
    }
};



export const getNodeIcon = (type: string, selectedEngineType: 'pyspark' | 'pyflink' = 'pyspark'): string => {
    // First, try to get icon from pipelineSchema for pipeline transformations
    const pipelineIcon = getIconFromPipelineSchema(type, selectedEngineType);
    if (pipelineIcon) {
        return pipelineIcon;
    }

    // Then, try to get icon from flowSchema for flow operators
    const flowIcon = getIconFromFlowSchema(type);
    if (flowIcon) {
        return flowIcon;
    }

    // Return default icon if not found in schemas
    return '/assets/buildPipeline/7.svg';
};

/**
 * Get icon from pipelineSchema for pipeline transformations
 */
const getIconFromPipelineSchema = (type: string, selectedEngineType: 'pyspark' | 'pyflink' = 'pyspark'): string | null => {
    try {
        let transformations;
        
        // Check if pipelineSchema is already an array of transformations (direct format)
        if (Array.isArray(pipelineSchema)) {
            transformations = pipelineSchema;
        } else {
            // Find the engine-specific schema in allOf (nested format)
            const schema = pipelineSchema as any;
            const engineSchema = schema.allOf?.find((schema: any) => 
                schema.if?.properties?.engine_type?.const === selectedEngineType
            );

            if (!engineSchema?.then?.properties?.transformations?.items?.allOf) {
                return null;
            }

            transformations = engineSchema.then.properties.transformations.items?.allOf;
        }

        if (!transformations || !Array.isArray(transformations)) {
            return null;
        }

        // Find the transformation that matches the type
        const transformation = transformations.find((t: any) => 
            t?.if?.properties?.transformation?.const === type
        );

        return transformation?.then?.ui_properties?.icon || null;
    } catch (error) {
        console.warn('Error getting icon from pipelineSchema:', error);
        return null;
    }
};

/**
 * Get icon from flowSchema for flow operators
 */
const getIconFromFlowSchema = (type: string): string | null => {
    try {
        const operators = flowSchema?.properties?.tasks?.items?.oneOf;
        if (!operators || !Array.isArray(operators)) {
            return null;
        }

        // Find the operator that matches the type
        const operator = operators.find((op: any) => 
            op?.properties?.type?.enum?.[0] === type
        );

        return operator?.properties?.type?.ui_properties?.icon || null;
    } catch (error) {
        console.warn('Error getting icon from flowSchema:', error);
        return null;
    }
};

export const getNodePorts = (type: string) => {
    const portsMap: { [key: string]: { inputs: number; outputs: number; maxInputs: number | 'unlimited' } } = {
        Reader: { inputs: 0, outputs: 1, maxInputs: 0 },
        Target: { inputs: 1, outputs: 0, maxInputs: 1 },
        Filter: { inputs: 1, outputs: 1, maxInputs: 1 },
        Joiner: { inputs: 2, outputs: 1, maxInputs: 'unlimited' },
        Ship: { inputs: 1, outputs: 1, maxInputs: 1 },
        SchemaTransformation: { inputs: 1, outputs: 1, maxInputs: 1 },
        Sorter: { inputs: 1, outputs: 1, maxInputs: 1 },
        Aggregator: { inputs: 1, outputs: 1, maxInputs: 1 },
        'DQ Check': { inputs: 1, outputs: 1, maxInputs: 1 },
        Deduplicator: { inputs: 1, outputs: 1, maxInputs: 1 },
        Repartition: { inputs: 1, outputs: 1, maxInputs: 1 },
        'SQLTransformation': { inputs: 1, outputs: 1, maxInputs: 'unlimited' },
        'SetCombiner': { inputs: 2, outputs: 1, maxInputs: 'unlimited' },
        'Set': { inputs: 2, outputs: 1, maxInputs: 'unlimited' },
        DqCheck: { inputs: 1, outputs: 1, maxInputs: 1 },
        Lookup: { inputs: 1, outputs: 1, maxInputs: 1 },
        CustomPySpark: { inputs: 1, outputs: 1, maxInputs: 1 },
        python: { inputs: 1, outputs: 1, maxInputs: 1 }

    };
    return portsMap[type] || { inputs: 1, outputs: 1, maxInputs: 1 };
};

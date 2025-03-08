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
            return {
                ...baseState,
                lookup_name: transformation.lookup_name || '',
                lookup_table: transformation.lookup_table || '',
                lookup_columns: transformation.lookup_columns || [{
                    source_column: '',
                    lookup_column: '',
                    output_column: ''
                }],
                lookup_conditions: transformation.lookup_conditions || [{
                    source_column: '',
                    lookup_column: '',
                    operator: '='
                }],
                broadcast_hint: transformation.broadcast_hint || false
            };

        case 'Dedup':
            return {
                ...baseState,
                keep: transformation.keep || "any",
                dedup_by: transformation.dedup_by || [],
                order_by: transformation.order_by || []
            };

        case 'SequenceGenerator':
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

        case 'Select':
            return {
                ...baseState,
                column_list: transformation.column_list?.map((col: any) => ({
                    name: col.name || '',
                    expression: col.expression || ''
                })) || [],
                transformation: transformation.transformation || ''
            };

        default:
            return transformation.name ? {
                ...transformation,
                name: transformation.name
            } : {};
    }
};
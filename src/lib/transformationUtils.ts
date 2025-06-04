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
                lookup_type: transformation.lookup_type || 'Column Based',
                lookup_config: transformation.lookup_config || { name: '', source: {} },
                lookup_conditions: transformation.lookup_conditions || [],
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
        

        default:
            return transformation.name ? {
                ...transformation,
                name: transformation.name
            } : {};
    }
};



export const getNodeIcon = (type: string): string => {
    const iconMap: { [key: string]: string } = {
        Reader: '/assets/buildPipeline/6.svg',
        Target: '/assets/buildPipeline/7.svg',
        Filter: '/assets/buildPipeline/display/filter.svg',
        Joiner: '/assets/buildPipeline/display/join.svg',
        Ship: '/assets/buildPipeline/display/ship.svg',
        SchemaTransformation: '/assets/buildPipeline/28.svg',
        Sorter: '/assets/buildPipeline/squre/1.svg',
        Aggregator: '/assets/buildPipeline/squre/2.svg',
        'DQ Check': '/assets/buildPipeline/squre/9.svg',
        Dedup: '/assets/buildPipeline/squre/5.svg',
        Repartition: '/assets/buildPipeline/squre/6.svg',
        'SQL Transformation': '/assets/buildPipeline/squre/7.svg',
        'Set Combiner': '/assets/buildPipeline/squre/8.svg',
        Select: '/assets/buildPipeline/squre/11.svg',
        SequenceGenerator: '/assets/buildPipeline/squre/12.svg',
        Drop: '/assets/buildPipeline/squre/13.svg',
        Lookup: '/assets/buildPipeline/squre/3.svg',
        CustomPySpark: '/assets/buildPipeline/squre/4.svg'
    };
    return iconMap[type] || '/assets/buildPipeline/default.svg';
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
        Dedup: { inputs: 1, outputs: 1, maxInputs: 1 },
        Repartition: { inputs: 1, outputs: 1, maxInputs: 1 },
        'SQL Transformation': { inputs: 1, outputs: 1, maxInputs: 1 },
        'Set Combiner': { inputs: 2, outputs: 1, maxInputs: 'unlimited' },
        Lookup: { inputs: 2, outputs: 1, maxInputs: 2 },
        CustomPySpark: { inputs: 1, outputs: 1, maxInputs: 1 }
    };
    return portsMap[type] || { inputs: 1, outputs: 1, maxInputs: 1 };
};

import { useMemo } from 'react';
import schema from '@/pages/designers/flow-playground/data/flow_schema.json';

export function useOtherTypes(type: string) {
    return useMemo(() => {
        if (!type) return null;
        const operators = schema.properties.tasks.items.oneOf;
        const operator = operators.find((item: any) => item.properties.type.enum[0] === type);
        if (!operator) return null;
        const groupedModule = operator.properties.type.ui_properties.module_name;
        const allTypesInModule = operators.filter((item: any) => item.properties.type.ui_properties.module_name === groupedModule).map((item: any) => item.properties.type.enum[0]);
        return allTypesInModule;
    }, [type]);
}

export function useSelectedType(op: string, type: string) {    
    return useMemo(() => {
        const operators = schema.properties.tasks.items.oneOf;
        const operator = operators.find((item: any) => item.properties.type.enum[0].toLowerCase() === op);
        if (!op) return null;
        if (!operator) return null;
        const propType = operator.properties[type];
        if (!propType) return null
        return {ui_properties: propType.ui_properties, enum: propType?.enum || []};
    }, [op, type]);
}
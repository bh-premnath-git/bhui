import { useMemo } from 'react';
import schema from '@/pages/manageFlow/data/flow_schema.json';

export function useOtherTypes(type: string) {
    return useMemo(() => {
        const operators = schema.properties.tasks.items.oneOf;
        const operator = operators.find((operator: any) => operator.properties.type.enum[0] === type);
        //console.log(operator);
        return operator;
    }, [type]);
}
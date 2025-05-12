import { useMemo } from 'react';
import {flowSchema as schema} from "@bh-ai/schemas";

/**
 * Hook to get all types in the same module as the provided type
 * @param type The operator type to find related types for
 * @returns Array of related operator types or null if not found
 */
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

/**
 * Get UI properties and enum values for a specific field of an operator
 * @param op The operator name (will be converted to lowercase for comparison)
 * @param type The field name to get properties for
 * @returns Object containing UI properties and enum values, or null if not found
 */
export function useSelectedType(op: string, type: string) {
    // Ensure we have valid inputs to prevent React hooks dependency array issues
    const safeOp = op || '';
    const safeType = type || '';
    
    return useMemo(() => {
        // Early return for invalid inputs
        if (!safeOp || !safeType) return null;
        
        try {
            // Get the schema operators
            const operators = schema.properties.tasks.items.oneOf;
            if (!Array.isArray(operators)) return null;
            
            // Find the matching operator (case insensitive)
            const operator = operators.find((item: any) => {
                try {
                    const enumValue = item?.properties?.type?.enum?.[0];
                    return typeof enumValue === 'string' && 
                           enumValue.toLowerCase() === safeOp.toLowerCase();
                } catch {
                    return false;
                }
            });
            
            if (!operator) return null;
            
            // Get the property type
            const propType = operator.properties?.[safeType];
            if (!propType) return null;
            
            // Return the UI properties and enum values
            return {
                ui_properties: propType.ui_properties || {},
                enum: Array.isArray(propType.enum) ? propType.enum : []
            };
        } catch (error) {
            console.error(`Error in useSelectedType(${safeOp}, ${safeType}):`, error);
            return null;
        }
    }, [safeOp, safeType]);
}
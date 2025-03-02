import { FieldTypeInfo } from './types';

export const getOperatorSchema = (operatorName: string, schemaData: any[]) => {
  const operatorLowerCase = operatorName.toLowerCase();
  return schemaData.find((item: any) => {
    try {
      return item.properties?.type?.enum?.[0]?.toLowerCase() === operatorLowerCase;
    } catch {
      return false;
    }
  });
};

export const validateField = (
  operator: string, 
  field: string, 
  value: string, 
  fieldTypeMapping: Record<string, Record<string, FieldTypeInfo>>
): boolean => {
  const isRequired = fieldTypeMapping[operator]?.[field]?.required || false;
  if (isRequired && !value.trim()) {
    return false;
  }
  return true;
};

export const getFieldGroups = (
  operator: string, 
  fields: string[], 
  fieldTypeMapping: Record<string, Record<string, FieldTypeInfo>>
) => {
  const groups: Record<string, string[]> = {
    property: [],
    settings: [],
    other: []
  };

  fields.forEach(field => {
    const groupKey = fieldTypeMapping[operator]?.[field]?.uiProperties?.groupKey || 'other';
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(field);
  });

  // Sort fields within each group by their order property
  Object.keys(groups).forEach(groupKey => {
    groups[groupKey].sort((a, b) => {
      const orderA = fieldTypeMapping[operator]?.[a]?.uiProperties?.order || 999;
      const orderB = fieldTypeMapping[operator]?.[b]?.uiProperties?.order || 999;
      return orderA - orderB;
    });
  });

  return groups;
};

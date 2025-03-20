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

  // If the value appears to be JSON, validate its structure
  if (value.trim().startsWith('[') || value.trim().startsWith('{')) {
    try {
      JSON.parse(value);
      // Successfully parsed, so it's valid JSON
      return true;
    } catch (e) {
      // If it looks like JSON but can't be parsed, it's invalid
      return false;
    }
  }

  return true;
};

export const parseFieldValue = (value: string) => {
  if (!value || typeof value !== 'string') return value;
  
  // Check if the value is a JSON string (array or object)
  if ((value.startsWith('[') && value.endsWith(']')) || 
      (value.startsWith('{') && value.endsWith('}'))) {
    try {
      return JSON.parse(value);
    } catch (e) {
      // If parsing fails, return the original string
      return value;
    }
  }
  
  return value;
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

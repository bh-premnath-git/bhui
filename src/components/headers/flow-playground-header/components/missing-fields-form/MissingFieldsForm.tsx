import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {flowSchema as schema} from "@bh-ai/schemas";
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { updateFormValues } from '@/store/slices/designer/flowSlice';
import { MissingFieldsFormProps, FormState, OperatorFieldPair, FieldTypeInfo } from './types';
import { getOperatorSchema, validateField, parseFieldValue } from './utils';
import { OperatorCard } from './OperatorCard';
import { removeUndefined } from '@/lib/object';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export const MissingFieldsForm: React.FC<MissingFieldsFormProps> = ({
  flowDefinition,
  onSubmit,
  initialValues = {}
}) => {
  const dispatch = useAppDispatch();
  const storeFormValues = useAppSelector(state => state.flow.formValues);
  const dependencies = useAppSelector(state => state.flow.dependencies || {});
  const [formState, setFormState] = useState<FormState>({
    values: {},
    errors: {}
  });
  const [dependencyWarnings, setDependencyWarnings] = useState<Record<string, string[]>>({});

  const operatorFieldPairs = useMemo(() => {
    const pairs: OperatorFieldPair[] = [];
    Object.entries(flowDefinition).forEach(([operator, fields]) => {
      pairs.push({ operator, fields });
    });
    return pairs;
  }, [flowDefinition]);

  const fieldTypeMapping = useMemo(() => {
    const mapping: Record<string, Record<string, FieldTypeInfo>> = {};
    const schemaData = schema.properties?.tasks?.items?.oneOf || [];
    
    operatorFieldPairs.forEach(({ operator, fields }) => {
      mapping[operator] = mapping[operator] || {};
      const operatorSchema = getOperatorSchema(operator, schemaData);

      if (operatorSchema && operatorSchema.properties) {
        const requiredFields = operatorSchema.required || [];
        
        fields.forEach(field => {
          const fieldSchema = operatorSchema.properties[field];
          if (fieldSchema) {
            const isMandatory = fieldSchema.ui_properties?.mandatory === true || requiredFields.includes(field);
            let fieldType = 'string';
            if (fieldSchema.type) {
              fieldType = fieldSchema.type;
            } else if (fieldSchema.items && fieldSchema.items.type) {
              fieldType = `array:${fieldSchema.items.type}`;
            }

            mapping[operator][field] = {
              type: fieldType,
              required: isMandatory,
              uiProperties: removeUndefined({
                propertyName: fieldSchema.ui_properties?.property_name,
                uiType: fieldSchema.ui_properties?.ui_type,
                order: fieldSchema.ui_properties?.order,
                spanCol: fieldSchema.ui_properties?.spancol,
                groupKey: fieldSchema.ui_properties?.group_key,
                default: fieldSchema.ui_properties?.default,
                endpoint: fieldSchema.ui_properties?.endpoint,
                selectOptions: fieldSchema.enum
              })
            };
          }
        });
      }
    });

    return removeUndefined(mapping);
  }, [operatorFieldPairs]);

  const operatorColors = useMemo(() => {
    const colors: Record<string, string> = {};
    const schemaData = schema.properties?.tasks?.items?.oneOf || [];

    operatorFieldPairs.forEach(({ operator }) => {
      const operatorSchema = getOperatorSchema(operator, schemaData);
      if (operatorSchema && operatorSchema.properties?.type?.ui_properties?.color) {
        colors[operator] = operatorSchema.properties.type.ui_properties.color;
      } else {
        colors[operator] = '#f0f0f0';
      }
    });

    return colors;
  }, [operatorFieldPairs]);

  // Check field dependencies when form values change
  useEffect(() => {
    // This function verifies if field values have dependencies on other fields
    const checkDependencies = () => {
      const warnings: Record<string, string[]> = {};
      
      // Skip if no dependencies are defined
      if (!dependencies || Object.keys(dependencies).length === 0) {
        return warnings;
      }

      // Iterate through each operator's fields
      Object.entries(formState.values).forEach(([operator, fields]) => {
        // Check if this operator has dependencies
        Object.entries(fields).forEach(([field, value]) => {
          const fieldKey = `${operator}.${field}`;
          
          // Check if this field is referenced in dependencies
          Object.entries(dependencies).forEach(([taskId, deps]) => {
            if (deps.includes(fieldKey)) {
              // This field is depended on by another task/field
              // Check if the value is valid for a dependency
              const parsedValue = parseFieldValue(value);
              if (!parsedValue || (typeof parsedValue === 'string' && !parsedValue.trim())) {
                // Field has empty/invalid value but is depended on
                if (!warnings[operator]) {
                  warnings[operator] = [];
                }
                warnings[operator].push(`Field "${field}" is required by dependencies`);
              }
            }
          });
        });
      });
      
      return warnings;
    };
    
    setDependencyWarnings(checkDependencies());
  }, [formState.values, dependencies]);

  useEffect(() => {
    const initialFormValues: Record<string, Record<string, string>> = {};
    const initialFormErrors: Record<string, Record<string, boolean>> = {};

    operatorFieldPairs.forEach(({ operator, fields }) => {
      initialFormValues[operator] = initialFormValues[operator] || {};
      initialFormErrors[operator] = initialFormErrors[operator] || {};

      fields.forEach(field => {
        if (initialValues[operator] && initialValues[operator][field] !== undefined) {
          initialFormValues[operator][field] = initialValues[operator][field];
        } else if (storeFormValues[operator] && storeFormValues[operator][field] !== undefined) {
          initialFormValues[operator][field] = storeFormValues[operator][field];
        } else if (fieldTypeMapping[operator]?.[field]?.uiProperties?.default) {
          initialFormValues[operator][field] = fieldTypeMapping[operator][field].uiProperties?.default || '';
        } else {
          initialFormValues[operator][field] = '';
        }
        
        const isRequired = fieldTypeMapping[operator]?.[field]?.required || false;
        const isEmpty = !initialFormValues[operator][field];
        initialFormErrors[operator][field] = isRequired && isEmpty;
      });
    });

    setFormState({
      values: initialFormValues,
      errors: initialFormErrors
    });
  }, [flowDefinition, initialValues, storeFormValues, operatorFieldPairs, fieldTypeMapping]);

  const handleInputChange = (operator: string, field: string, value: string) => {
    setFormState(prev => ({
      values: {
        ...prev.values,
        [operator]: {
          ...prev.values[operator],
          [field]: value
        }
      },
      errors: {
        ...prev.errors,
        [operator]: {
          ...prev.errors[operator],
          [field]: !validateField(operator, field, value, fieldTypeMapping)
        }
      }
    }));

    dispatch(updateFormValues({ operator, field, value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasErrors = false;
    const newErrors: Record<string, Record<string, boolean>> = {};
    Object.entries(formState.values).forEach(([operator, fields]) => {
      newErrors[operator] = {};
      Object.entries(fields).forEach(([field, value]) => {
        const isValid = validateField(operator, field, value, fieldTypeMapping);
        newErrors[operator][field] = !isValid;
        if (!isValid) {
          hasErrors = true;
        }
      });
    });

    setFormState(prev => ({
      ...prev,
      errors: newErrors
    }));

    // Don't submit if there are validation errors
    if (hasErrors) {
      return;
    }

    // Check if we have dependency warnings and handle them
    const hasWarnings = Object.values(dependencyWarnings).some(warnings => warnings.length > 0);
    // Even with warnings, we'll submit - but could add a confirmation here if needed

    onSubmit(formState.values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display dependency warnings if any */}
      {Object.entries(dependencyWarnings).map(([operator, warnings]) => 
        warnings.length > 0 ? (
          <Alert key={operator} variant="default" className="bg-amber-50 border-amber-200">
            <InfoIcon className="h-4 w-4 text-amber-400" />
            <AlertTitle>Dependency Warning: {operator}</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 text-sm">
                {warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null
      )}

      {operatorFieldPairs.map(({ operator, fields }) => (
        <OperatorCard
          key={operator}
          operator={operator}
          fields={fields}
          color={operatorColors[operator] || '#f0f0f0'}
          formValues={formState.values}
          formErrors={formState.errors}
          fieldTypeMapping={fieldTypeMapping}
          onChange={handleInputChange}
        />
      ))}
      <div className="text-xs text-gray-500 mb-2">
        <span className="text-red-500">*</span> Required fields
      </div>
      <Button variant="ghost" type="submit" className="w-full">Submit</Button>
    </form>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import schema from '@/pages/designers/flow-playground/data/flow_schema.json';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { updateFormValues } from '@/store/slices/designer/flowSlice';
import { MissingFieldsFormProps, FormState, OperatorFieldPair, FieldTypeInfo } from './types';
import { getOperatorSchema, validateField } from './utils';
import { OperatorCard } from './OperatorCard';

export const MissingFieldsForm: React.FC<MissingFieldsFormProps> = ({
  flowDefinition,
  onSubmit,
  initialValues = {}
}) => {
  const dispatch = useAppDispatch();
  const storeFormValues = useAppSelector(state => state.flow.formValues);
  const [formState, setFormState] = useState<FormState>({
    values: {},
    errors: {}
  });

  // Compute operator-field pairs only when flowDefinition changes
  const operatorFieldPairs = useMemo(() => {
    const pairs: OperatorFieldPair[] = [];
    Object.entries(flowDefinition).forEach(([operator, fields]) => {
      pairs.push({ operator, fields });
    });
    return pairs;
  }, [flowDefinition]);

  // Extract field type and UI information from schema
  const fieldTypeMapping = useMemo(() => {
    const mapping: Record<string, Record<string, FieldTypeInfo>> = {};
    const schemaData = schema.properties?.tasks?.items?.oneOf || [];
    
    operatorFieldPairs.forEach(({ operator, fields }) => {
      mapping[operator] = mapping[operator] || {};
      const operatorSchema = getOperatorSchema(operator, schemaData);

      if (operatorSchema && operatorSchema.properties) {
        const requiredFields = operatorSchema.required || [];
        
        // Log operator schema info (can be removed in production)
        console.log(`Operator: ${operator}`, {
          required: requiredFields,
          properties: Object.keys(operatorSchema.properties)
        });
        
        fields.forEach(field => {
          const fieldSchema = operatorSchema.properties[field];
          if (fieldSchema) {
            const isMandatory = fieldSchema.ui_properties?.mandatory === true || requiredFields.includes(field);
            
            // Log field ui_properties (can be removed in production)
            console.log(`Field: ${operator}.${field}`, {
              ui_properties: fieldSchema.ui_properties,
              type: fieldSchema.type || (fieldSchema.items && `array:${fieldSchema.items.type}`) || 'string',
              required: isMandatory
            });

            let fieldType = 'string';
            if (fieldSchema.type) {
              fieldType = fieldSchema.type;
            } else if (fieldSchema.items && fieldSchema.items.type) {
              fieldType = `array:${fieldSchema.items.type}`;
            }

            mapping[operator][field] = {
              type: fieldType,
              required: isMandatory,
              uiProperties: {
                propertyName: fieldSchema.ui_properties?.property_name,
                uiType: fieldSchema.ui_properties?.ui_type,
                order: fieldSchema.ui_properties?.order,
                spanCol: fieldSchema.ui_properties?.spancol,
                groupKey: fieldSchema.ui_properties?.group_key,
                default: fieldSchema.ui_properties?.default,
                endpoint: fieldSchema.ui_properties?.endpoint
              }
            };
          }
        });
      }
    });

    return mapping;
  }, [operatorFieldPairs]);

  // Extract colors for operators
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

  // Initialize form values and errors
  useEffect(() => {
    const initialFormValues: Record<string, Record<string, string>> = {};
    const initialFormErrors: Record<string, Record<string, boolean>> = {};

    operatorFieldPairs.forEach(({ operator, fields }) => {
      initialFormValues[operator] = initialFormValues[operator] || {};
      initialFormErrors[operator] = initialFormErrors[operator] || {};

      fields.forEach(field => {
        // Use initialValues if available, otherwise default values or empty string
        if (initialValues[operator] && initialValues[operator][field] !== undefined) {
          initialFormValues[operator][field] = initialValues[operator][field];
        } else if (storeFormValues[operator] && storeFormValues[operator][field] !== undefined) {
          initialFormValues[operator][field] = storeFormValues[operator][field];
        } else if (fieldTypeMapping[operator]?.[field]?.uiProperties?.default) {
          initialFormValues[operator][field] = fieldTypeMapping[operator][field].uiProperties?.default || '';
        } else {
          initialFormValues[operator][field] = '';
        }
        
        // Initialize error states for required fields
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

  // Handle field changes
  const handleInputChange = (operator: string, field: string, value: string) => {
    // Update local form state
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

    // Update Redux store
    dispatch(updateFormValues({ operator, field, value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasErrors = false;
    const newErrors: Record<string, Record<string, boolean>> = {};

    // Validate all fields
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

    // Update error states
    setFormState(prev => ({
      ...prev,
      errors: newErrors
    }));

    // Submit if no errors
    if (!hasErrors) {
      onSubmit(formState.values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

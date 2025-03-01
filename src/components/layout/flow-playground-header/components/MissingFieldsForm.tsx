import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import schema from '@/pages/designers/flow-playground/data/flow_schema.json';

interface MissingFieldsFormProps {
  flowDefinition: Record<string, string[]>;
  onSubmit: (values: Record<string, Record<string, string>>) => void;
  initialValues?: Record<string, Record<string, string>>;
}

export const MissingFieldsForm: React.FC<MissingFieldsFormProps> = ({ 
  flowDefinition, 
  onSubmit,
  initialValues = {} 
}) => {
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});
  const [fieldTypeMapping, setFieldTypeMapping] = useState<Record<string, Record<string, string>>>({});

  // Initialize form values from flowDefinition and initialValues
  useEffect(() => {
    const initialFormValues: Record<string, Record<string, string>> = {};
    
    Object.entries(flowDefinition).forEach(([operator, fields]) => {
      initialFormValues[operator] = initialFormValues[operator] || {};
      
      fields.forEach(field => {
        // Use initialValues if available, otherwise empty string
        if (initialValues[operator] && initialValues[operator][field] !== undefined) {
          initialFormValues[operator][field] = initialValues[operator][field];
        } else {
          initialFormValues[operator][field] = '';
        }
      });
    });
    
    setFormValues(initialFormValues);
  }, [flowDefinition, initialValues]);

  // Process schema to get field types
  useEffect(() => {
    const mapping: Record<string, Record<string, string>> = {};
    const schemaData = schema.properties?.tasks?.items?.oneOf || [];
    
    Object.keys(flowDefinition).forEach(operator => {
      mapping[operator] = mapping[operator] || {};
      const operatorLowerCase = operator.toLowerCase();
      
      // Find the operator in the schema
      const operatorSchema = schemaData.find((item: any) => {
        try {
          return item.properties?.type?.enum?.[0]?.toLowerCase() === operatorLowerCase;
        } catch {
          return false;
        }
      });
      
      if (operatorSchema && operatorSchema.properties) {
        // Map each field to its type
        flowDefinition[operator].forEach(field => {
          const fieldSchema = operatorSchema.properties[field];
          if (fieldSchema) {
            if (fieldSchema.type) {
              mapping[operator][field] = fieldSchema.type;
            } else if (fieldSchema.items && fieldSchema.items.type) {
              mapping[operator][field] = `array:${fieldSchema.items.type}`;
            }
          }
        });
      }
    });
    
    setFieldTypeMapping(mapping);
  }, [flowDefinition]);

  const handleInputChange = (operator: string, field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [operator]: {
        ...prev[operator],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  // Render form fields based on their types
  const renderField = (operator: string, field: string) => {
    const fieldType = fieldTypeMapping[operator]?.[field] || 'string';
    const value = formValues[operator]?.[field] || '';
    
    // Handle array types
    if (fieldType.startsWith('array:')) {
      return (
        <Input
          key={`${operator}-${field}`}
          id={`${operator}-${field}`}
          value={value}
          onChange={(e) => handleInputChange(operator, field, e.target.value)}
          placeholder={`Enter comma-separated ${field} values`}
          className="h-8 text-sm"
        />
      );
    }
    
    // Handle different primitive types
    switch (fieldType) {
      case 'integer':
      case 'number':
        return (
          <Input
            key={`${operator}-${field}`}
            id={`${operator}-${field}`}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(operator, field, e.target.value)}
            placeholder={`Enter ${field}`}
            className="h-8 text-sm"
          />
        );
      case 'boolean':
        return (
          <select
            id={`${operator}-${field}`}
            value={value}
            onChange={(e) => handleInputChange(operator, field, e.target.value)}
            className="w-full p-2 border rounded-md h-8 text-sm"
          >
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      default:
        return (
          <Input
            key={`${operator}-${field}`}
            id={`${operator}-${field}`}
            value={value}
            onChange={(e) => handleInputChange(operator, field, e.target.value)}
            placeholder={`Enter ${field}`}
            className="h-8 text-sm"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(flowDefinition).map(([operator, fields]) => (
        <Card key={operator}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{operator}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields.map(field => (
              <div key={field} className="grid gap-1.5">
                <Label htmlFor={`${operator}-${field}`} className="text-xs">
                  {field}
                </Label>
                {renderField(operator, field)}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <Button type="submit" className="w-full">Submit</Button>
    </form>
  );
};

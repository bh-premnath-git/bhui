import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSelectedType } from '@/hooks/useOtherTypes';

interface MissingFieldsFormProps {
  flowDefinition: Record<string, string[]>;
  onSubmit: (values: Record<string, Record<string, string>>) => void;
}

export const MissingFieldsForm: React.FC<MissingFieldsFormProps> = ({ 
  flowDefinition, 
  onSubmit 
}) => {
  // Initialize form values
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>(() => {
    const initialValues: Record<string, Record<string, string>> = {};
    
    Object.entries(flowDefinition).forEach(([operator, fields]) => {
      initialValues[operator] = {};
      fields.forEach(field => {
        initialValues[operator][field] = '';
      });
    });
    
    return initialValues;
  });

  // Extract all operator-field pairs to create a stable array for hooks
  const operatorFieldPairs = useMemo(() => {
    const pairs: { operator: string; field: string }[] = [];
    
    Object.entries(flowDefinition).forEach(([operator, fields]) => {
      fields.forEach(field => {
        pairs.push({ 
          operator: operator.toLowerCase(), 
          field 
        });
      });
    });
    
    return pairs;
  }, [flowDefinition]);

  // Create a mapping of field types using hooks at the top level
  const fieldTypeMapping = useMemo(() => {
    const mapping: Record<string, Record<string, string>> = {};
    
    operatorFieldPairs.forEach(({ operator, field }) => {
      const originalOperator = Object.keys(flowDefinition)
        .find(key => key.toLowerCase() === operator);
      
      if (!originalOperator) return;
      
      if (!mapping[originalOperator]) {
        mapping[originalOperator] = {};
      }
      
      // Use the hook for each operator-field pair
      const fieldInfo = useSelectedType(operator, field);
      mapping[originalOperator][field] = fieldInfo?.ui_properties?.type || 'text';
    });
    
    return mapping;
  }, [operatorFieldPairs, flowDefinition]);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(flowDefinition).map(([operator, fields]) => (
        <Card key={operator} className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{operator}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields.map(field => {
              // Get the field type from our pre-computed mapping
              const fieldType = fieldTypeMapping[operator]?.[field] || 'text';
              
              return (
                <div key={field} className="grid gap-1.5">
                  <Label htmlFor={`${operator}-${field}`} className="text-xs">
                    {field} {fieldType !== 'text' && `(${fieldType})`}
                  </Label>
                  <Input
                    id={`${operator}-${field}`}
                    value={formValues[operator][field]}
                    onChange={(e) => handleInputChange(operator, field, e.target.value)}
                    placeholder={`Enter ${field}`}
                    className="h-8 text-sm"
                    type={fieldType === 'number' ? 'number' : 'text'}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
      <Button type="submit" className="w-full">Submit</Button>
    </form>
  );
};

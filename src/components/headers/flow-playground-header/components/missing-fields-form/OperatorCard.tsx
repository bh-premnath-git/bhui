import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { OperatorCardProps } from './types';
import { getFieldGroups } from './utils';
import { FieldGroup } from './FieldGroup';

export const OperatorCard: React.FC<OperatorCardProps> = ({ 
  operator, 
  fields, 
  color, 
  formValues, 
  formErrors, 
  fieldTypeMapping, 
  onChange 
}) => {
  const fieldGroups = getFieldGroups(operator, fields, fieldTypeMapping);
  
  return (
    <Card style={{
      borderTop: `3px solid ${color || '#f0f0f0'}`,
      background: `${color || '#f0f0f0'}10`
    }}>
      <CardHeader style={{ borderBottom: `1px solid ${color}30` }}>
        <CardTitle className="text-sm font-medium" style={{ color }}>
          {operator}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {Object.entries(fieldGroups).map(([group, groupFields]) => (
          <FieldGroup
            key={`${operator}-${group}`}
            operator={operator}
            groupKey={group}
            fields={groupFields}
            formValues={formValues}
            formErrors={formErrors}
            fieldTypeMapping={fieldTypeMapping}
            onChange={onChange}
          />
        ))}
      </CardContent>
    </Card>
  );
};

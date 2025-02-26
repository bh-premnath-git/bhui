import React from 'react';
import { FormField } from './FormField';
import { Property, FormValues } from '@/types/designer/flow';

interface FormLayoutProps {
  properties: Property[];
  formValues: FormValues;
  onInputChange: (key: string, value: string) => void;
  dependsOn?: string[];
}

export const FormLayout: React.FC<FormLayoutProps> = React.memo(({ 
  properties, 
  formValues, 
  dependsOn, 
  onInputChange 
}) => {
  const rows: Property[][] = [];
  let currentRow: Property[] = [];
  let currentRowWidth = 0;

  properties.forEach((property) => {
        
    const spancol = property.ui_properties.spancol || 1;
    
    if (currentRowWidth + spancol > 2) {
      rows.push(currentRow);
      currentRow = [property];
      currentRowWidth = spancol;
    } else {
      currentRow.push(property);
      currentRowWidth += spancol;
    }
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return (
    <div className="space-y-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-2 gap-4">
          {row.map((property) => (
            <FormField
              key={property.ui_properties.property_key}
              property={property}
              value={formValues[property.ui_properties.property_key] || ''}
              onChange={onInputChange}
              dependsOn={dependsOn}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

FormLayout.displayName = 'FormFields';
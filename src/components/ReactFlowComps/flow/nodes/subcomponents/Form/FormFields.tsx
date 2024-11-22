import React from 'react';
import { FormField } from '@/components/ReactFlowComps/flow/nodes/subcomponents/Form/FormField';
import { Property, FormValues } from '@/types/flow';

interface FormFieldsProps {
  properties: Property[];
  formValues: FormValues;
  onInputChange: (key: string, value: string) => void;
  dependsOn?: string[];
}

export const FormFields: React.FC<FormFieldsProps> = React.memo(({ 
  properties, 
  formValues, 
  dependsOn, 
  onInputChange 
}) => {
  // Group properties into rows based on spancol
  const rows: Property[][] = [];
  let currentRow: Property[] = [];
  let currentRowWidth = 0;

  properties.forEach((property) => {
    const spancol = property.ui_properties.spancol || 1;
    
    // If adding this property would exceed 2 columns, start a new row
    if (currentRowWidth + spancol > 2) {
      rows.push(currentRow);
      currentRow = [property];
      currentRowWidth = spancol;
    } else {
      currentRow.push(property);
      currentRowWidth += spancol;
    }
  });

  // Add the last row if it has any properties
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

FormFields.displayName = 'FormFields';
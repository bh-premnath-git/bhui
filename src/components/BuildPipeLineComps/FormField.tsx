import React from 'react';
import { Field } from 'formik';
import { TextField, MenuItem } from '@mui/material';
import { commonTextFieldStyles } from './styles/formStyles';
import { Schema } from './types/formTypes';

interface FormFieldProps {
  fieldSchema: Schema;
  name: string;
  fieldKey: string;
  enumValues?: string[];
  value: string;
}

export const FormField: React.FC<FormFieldProps> = React.memo(({ 
  fieldSchema, 
  name, 
  fieldKey, 
  enumValues,value
}) => {
  if (enumValues) {
    return (
      <Field name={name}>
        {({ field }: any) => (
          <TextField
            {...field}
            select
            size='small'
            fullWidth
            value={value}
            required={fieldSchema.required}
            variant="outlined"
            sx={commonTextFieldStyles}
          >
            {enumValues.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Field>
    );
  }

  const isExpression = fieldSchema.ui_type === 'expression';
  
  return (
    <Field name={name}>
      {({ field }: any) => (
        <TextField 
          {...field}
          size='small'
          placeholder={`Enter ${fieldKey}`}
          fullWidth
          value={value}
          multiline={isExpression}
          rows={isExpression ? 2 : 1}
          required={fieldSchema.required}
          helperText={fieldSchema.description}
          variant="outlined"
          sx={commonTextFieldStyles}
        />
      )}
    </Field>
  );
});

FormField.displayName = 'FormField'; 
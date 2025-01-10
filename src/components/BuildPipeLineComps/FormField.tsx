import React from 'react';
import { Field } from 'formik';
import { TextField, MenuItem } from '@mui/material';
import { commonTextFieldStyles } from './styles/formStyles';
import { Schema } from './types/formTypes';
import { lazy } from 'react';

interface FormFieldProps {
  fieldSchema: Schema;
  name: string;
  fieldKey: string;
  enumValues?: string[];
  value: string;
  isExpression?: boolean;
  required?: boolean;
}

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

// Define the handleEditorError function
const handleEditorError = (error: any) => {
  console.error('Error loading Monaco Editor:', error);
  // Optionally, you can display a user-friendly message or take other actions
};

export const FormField: React.FC<FormFieldProps> = React.memo(({
  fieldSchema,
  name,
  fieldKey,
  enumValues,
  value,
  isExpression,
  required
}) => {
  const label = (
    <span>
      {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')}
      {required && <span style={{ color: 'red' }}> *</span>}
    </span>
  );

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
            required={required}
            label={label}
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

  return (
    <Field name={name}>
      {({ field, form }: any) => (
        isExpression ? (
          <div style={{}}>
            <MonacoEditor
              className='w-full shadow-sm border-gray-300 rounded-sm '
              height="100px"
              defaultLanguage="sql"
              value={value}
              onChange={(newValue) => form.setFieldValue(name, newValue)}
              options={{
                minimap: { enabled: false },
                automaticLayout: true,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                theme: 'vs-light',
                fontSize: 13,
                padding: { top: 8, bottom: 8 },
                scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                overviewRulerLanes: 0,
                renderLineHighlight: 'none',
                quickSuggestions: { other: true, comments: true, strings: true },
                quickSuggestionsDelay: 0,
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: 'off'
              }}
            // loading={<div>Loading editor...</div>}
            // onError={handleEditorError}
            />
          </div>
        ) : (
          <TextField
            {...field}
            size='small'
            placeholder={`Enter ${fieldKey}`}
            fullWidth
            value={value}
            required={required}
            // label={label}
            helperText={fieldSchema.description}
            variant="outlined"
            sx={commonTextFieldStyles}
          />
        )
      )}
    </Field>
  );
});

FormField.displayName = 'FormField'; 
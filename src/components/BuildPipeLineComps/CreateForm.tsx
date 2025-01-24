import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Formik, Form, FieldArray, useFormikContext } from 'formik';
import { Tabs, Tab, Box, Button, Stack, IconButton, Dialog, DialogContent } from '@mui/material';
import { commonTextFieldStyles, buttonStyles } from './styles/formStyles';
import { Schema, CreateFormProps, TabPanelProps } from './types/formTypes';
import { FormField } from './FormField';
import { useHotkeys } from 'react-hotkeys-hook';

type ArraySchema = {
  items: Record<string, any>;
  minItems?: number;
};

type FormValues = Record<string, any>;

interface HistoryState {
  past: FormValues[];
  present: FormValues;
  future: FormValues[];
}

interface TransformationFormValues {
  conditions?: Array<{
    join_input: string;
    join_condition: string;
    join_type: string;
  }>;
  expressions?: Array<{
    target_column: string;
    expression: string;
  }>;
  derived_fields?: Array<{
    name: string;
    expression: string;
  }>;
  sort_columns?: Array<{
    column: string;
    order: string;
  }>;
  group_by?: string[];
  aggregate?: Array<{
    expression: string;
    target_column: string;
  }>;
  pivot?: Array<{
    pivot_column: string;
    pivot_values: string[];
  }>;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const safeArray = (value: any) => Array.isArray(value) ? value : [];

const CreateFormFormik: React.FC<CreateFormProps> = ({ schema, onSubmit, initialValues }) => {
  /* console.log('initialValues', initialValues);
  console.log('schema', schema);
  console.log('initialValues', initialValues?.expressions); */
  const generateInitialValues = useCallback((schema: Schema): FormValues => {
    if (initialValues) {
      switch (schema.title) {
        case 'Filter':
          return {
            condition: initialValues.condition || ''
          };

        case 'Joiner':
          return {
            conditions: initialValues.conditions || [{
              join_input: '',
              join_condition: '',
              join_type: 'left'
            }],
            expressions: initialValues.expressions ? initialValues.expressions.map((expr: any) => ({
              name: expr.target_column || '',
              expression: expr.expression || ''
            })) : [{
              name: '',
              expression: ''
            }],
            advanced: initialValues.advanced.hints || [{
              join_input: '',
              hint_type: 'broadcast'
            }]
          };

        case 'SchemaTransformation':
          return {
            derived_fields: initialValues.derived_fields?.map((field: any) => ({
              name: field.name,
              expression: field.expression
            })) || [{
              name: '',
              expression: ''
            }]
          };

        case 'Sorter':
          return {
            sort_columns: initialValues.sort_columns?.map((col: any) => ({
              column: col.column,
              order: col.order
            })) || [{
              column: '',
              order: 'asc'
            }]
          };

        case 'Aggregator':
          return {
            group_by: initialValues.group_by.map((col: any) => ({
              group_by: col
            })) || [{ group_by: '' }],
            aggregations: initialValues.aggregate?.map((agg: any) => ({
              target_column: agg.target_column,
              expression: agg.expression
            })) || [{
              target_column: '',
              expression: ''
            }],
            pivot_by: initialValues.pivot?.map((piv: any) => ({
              pivot_column: piv.pivot_column,
              pivot_values: Array.isArray(piv.pivot_values) ? piv.pivot_values : []
            })) || [{
              pivot_column: '',
              pivot_values: []
            }]
          };

        default:
          return initialValues || {};
      }
    }

    // If no initialValues, create default structure based on schema
    const createDefaultValue = (schema: any) => {
      if (schema.type === 'object') {
        return Object.entries(schema.properties).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: createDefaultValue(value)
        }), {});
      }

      if (schema.type === 'array') {
        const emptyItem = createDefaultValue(schema.items);
        return Array(schema.minItems || 1).fill(null).map(() => ({ ...emptyItem }));
      }

      if (schema.enum && schema.enum.length > 0) {
        return schema.default || schema.enum[0];
      }

      return schema.type === 'boolean' ? false :
        schema.type === 'number' ? 0 : '';
    };

    return createDefaultValue(schema) as FormValues;
  }, [initialValues]);

  const initialFormValues = useMemo(() => generateInitialValues(schema), [schema, generateInitialValues]);

  /* console.log('Schema:', schema);
  console.log('Initial values:', initialValues);
  console.log('Generated form values:', initialFormValues); */

  // Add state for undo/redo
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialFormValues,
    future: []
  });

  // Add these functions to handle undo/redo
  const handleUndo = useCallback(() => {
    setHistory(currentHistory => {
      if (currentHistory.past.length === 0) return currentHistory;

      const previous = currentHistory.past[currentHistory.past.length - 1];
      const newPast = currentHistory.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [currentHistory.present, ...currentHistory.future]
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistory(currentHistory => {
      if (currentHistory.future.length === 0) return currentHistory;

      const next = currentHistory.future[0];
      const newFuture = currentHistory.future.slice(1);

      return {
        past: [...currentHistory.past, currentHistory.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  // Add keyboard shortcuts
  useHotkeys('ctrl+z', (e) => {
    e.preventDefault();
    handleUndo();
  });

  useHotkeys('ctrl+y', (e) => {
    e.preventDefault();
    handleRedo();
  });

  return (
    <Formik
      initialValues={history.present}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validateOnBlur={true}
      validateOnChange={false}
    >
      {({ values, setValues }) => {
        // Add effect to update history when values change
        useEffect(() => {
          if (JSON.stringify(values) !== JSON.stringify(history.present)) {
            setHistory(currentHistory => ({
              past: [...currentHistory.past, currentHistory.present],
              present: values,
              future: []
            }));
          }
        }, [values]);

        return <FormContent schema={schema} />;
      }}
    </Formik>
  );
};

const renderArrayFields = (arraySchema: ArraySchema, values: FormValues, section: string) => {
  return (
    <FieldArray
      name={section}
      render={arrayHelpers => (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {Object.entries(arraySchema.items).map(([fieldKey, fieldSchema]: [string, any]) => (
              <Box key={fieldKey} sx={{ flex: 1 }}>
                <Box sx={{ mb: 1, fontWeight: 'bold' }}>
                  {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Box>
              </Box>
            ))}
            <Box sx={{ width: 40 }} />
          </Box>

          {safeArray(values[section]).map((field: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {Object.entries(arraySchema.items).map(([fieldKey, fieldSchema]: [string, any]) => {
                const defaultValue = fieldSchema.enum ? fieldSchema.enum[0] :
                  fieldSchema.type === 'boolean' ? false :
                    fieldSchema.type === 'number' ? 0 : '';

                const isExpression = fieldSchema.type === 'expression' ||
                  (fieldSchema['ui-hint'] === 'expression') ||
                  (section === 'expressions' && fieldKey === 'expression') ||
                  (fieldKey === 'join_condition');

                return (
                  <Box key={fieldKey} sx={{ flex: 1 }}>
                    <FormField
                      fieldSchema={fieldSchema}
                      name={`${section}.${index}.${fieldKey}`}
                      fieldKey={fieldKey}
                      enumValues={fieldSchema.enum}
                      value={field[fieldKey] ?? defaultValue}
                      isExpression={isExpression}
                    />
                  </Box>
                );
              })}
              <IconButton
                onClick={() => arrayHelpers.remove(index)}
                disabled={(values[section] || []).length <= (arraySchema.minItems || 1)}
                sx={buttonStyles.removeButton}
              >
                <span>×</span>
              </IconButton>
            </Box>
          ))}
          <Button
            onClick={() => {
              const emptyItem = Object.keys(arraySchema.items).reduce(
                (acc, key) => ({
                  ...acc,
                  [key]: arraySchema.items[key].enum ?
                    (arraySchema.items[key].default || arraySchema.items[key].enum[0]) :
                    arraySchema.items[key].type === 'boolean' ? false : ''
                }),
                {}
              );
              arrayHelpers.push(emptyItem);
            }}
            sx={{ textTransform: 'none', color: 'green', fontWeight: 'bold' }}
            startIcon={<img src={'/assets/plus-circle.svg'} alt="Add" />}
          >
            Add Field
          </Button>
        </Box>
      )}
    />
  );
};

const FormContent: React.FC<{ schema: Schema }> = ({ schema }) => {
  const { values } = useFormikContext<FormValues>();
  const [activeTab, setActiveTab] = useState(0);

  const renderTabContent = (section: string, sectionSchema: any) => {
    return renderArrayFields(sectionSchema, values, section);
  };

  return (
    <Form>
      <Box sx={{ width: '100%' }}>
        {schema.ui_type === 'tab-container' ? (
          <>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#000000',
                },
                '& .Mui-selected': {
                  color: '#000000 !important',
                },
              }}
            >
              {Object.keys(schema.properties).map((key) => (
                <Tab
                  sx={{ textTransform: 'none' }}
                  key={key}
                  label={key.replace(/_/g, ' ').split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                />
              ))}
            </Tabs>

            {Object.entries(schema.properties).map(([key, value]: [string, any], index) => (
              <TabPanel key={key} value={activeTab} index={index}>
                {renderTabContent(key, value)}
              </TabPanel>
            ))}
          </>
        ) : schema.ui_type === 'array-container' ? (
          <Stack spacing={2}>
            <Box>
              {schema.properties?.derived_fields ? renderArrayFields(schema.properties?.derived_fields, values, 'derived_fields') : renderArrayFields(schema.properties?.sort_columns, values, 'sort_columns')}
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {Object.entries(schema.properties).map(([key, value]: [string, any]) => (
              <Box key={key}>
                <h3>{key.replace(/_/g, ' ').toUpperCase()}</h3>
                <FormField
                  fieldSchema={value}
                  name={key}
                  fieldKey={key}
                  value={values[key]}
                  isExpression={value.type === 'expression'}
                />
              </Box>
            ))}
          </Stack>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            sx={buttonStyles.submitButton}
            type="submit"
            variant="contained"
          >
            Save
          </Button>
        </Box>
      </Box>
    </Form>
  );
};

export default CreateFormFormik;


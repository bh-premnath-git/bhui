import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Formik, Form, FieldArray, useFormikContext, Field } from 'formik';
import { Tabs, Tab, Box, Button, Stack, IconButton, Dialog, DialogContent } from '@mui/material';
import { commonTextFieldStyles, buttonStyles } from './styles/formStyles';
import { Schema, TabPanelProps } from './types/formTypes';
import { FormField } from './FormField';
import { useHotkeys } from 'react-hotkeys-hook';
import { ApiService } from '@/services/apiServices';

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

interface CreateFormProps {
  schema: Schema;
  onSubmit: (values: any) => void;
  initialValues?: any;
  nodes: any[];
  sourceColumns: SourceColumn[];
}

interface SourceColumn {
  name: string;
  dataType: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const safeArray = (value: any) => Array.isArray(value) ? value : [];

const CreateFormFormik: React.FC<CreateFormProps> = ({ schema, onSubmit, initialValues, nodes, sourceColumns }) => {
  console.log('initialValues', initialValues);
  console.log('schema', schema);
  console.log('initialValues', initialValues?.expressions);

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
            expressions: initialValues.expressions?.map((expr: any) => ({
              name: expr?.target_column || '',
              expression: expr?.expression || ''
            })) || [{
              name: '',
              expression: ''
            }],
            advanced: {
              hints: initialValues.advanced?.hints || [{
                join_input: '',
                hint_type: 'broadcast'
              }]
            }
          };

        case 'SchemaTransformation':
          return {
            derived_fields: initialValues.derived_fields?.map((field: any) => ({
              name: field?.name || '',
              expression: field?.expression || ''
            })) || [{
              name: '',
              expression: ''
            }]
          };

        case 'Sorter':
          return {
            sort_columns: initialValues.sort_columns?.map((col: any) => ({
              column: col?.column || '',
              order: col?.order || 'asc'
            })) || [{
              column: '',
              order: 'asc'
            }]
          };

        case 'Aggregator':
          return {
            group_by: initialValues.group_by?.map((col: any) => ({
              group_by: col || ''
            })) || [{ group_by: '' }],
            aggregations: initialValues.aggregate?.map((agg: any) => ({
              target_column: agg?.target_column || '',
              expression: agg?.expression || ''
            })) || [{
              target_column: '',
              expression: ''
            }],
            pivot_by: initialValues.pivot?.map((piv: any) => ({
              pivot_column: piv?.pivot_column || '',
              pivot_values: Array.isArray(piv?.pivot_values) ? piv.pivot_values : []
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

  console.log('Schema:', schema);
  console.log('Initial values:', initialValues);
  console.log('Generated form values:', initialFormValues);

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

  // Function to handle expression field click
  const handleExpressionClick = useCallback(async (targetColumn: string, setFieldValue: (field: string, value: any) => void, fieldName: string) => {
    // try {
    //   const schemaString = sourceColumns
    //     .map(column =>
    //       `${column.name}: ${column.dataType}`
    //     )
    //     .join(',');
    //   const response = await ApiService(
    //     "8090",
    //     "post",
    //     "/api/v1/pipeline_agent/generate",
    //     {
    //       operation_type: "spark_expression",
    //       params: {
    //         schema: schemaString,
    //         target_column: targetColumn
    //       },
    //       thread_id: "spark_123"
    //     },
    //     null,
    //     {},
    //     false
    //   );

    //   if (response?.result) {
    //     const parsedResult = JSON.parse(response.result);
    //     const expression = parsedResult === "UNABLE_TO_GENERATE" ? '' : parsedResult.expression;

    //     setFieldValue(fieldName, expression);
    //   }
    // } catch (error) {
    //   console.error('Error generating expression:', error);
    //   setFieldValue(fieldName, '');
    // }
  }, [sourceColumns]);

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

        return <FormContent
          schema={schema}
          onExpressionClick={handleExpressionClick}
          sourceColumns={sourceColumns}
        />;
      }}
    </Formik>
  );
};

const renderArrayFields = (
  arraySchema: ArraySchema,
  values: FormValues,
  section: string,
  onExpressionClick: (targetColumn: string, setFieldValue: (field: string, value: any) => void, fieldName: string) => void,
  sourceColumns: SourceColumn[]
) => {
  // Add null check for arraySchema and its items
  if (!arraySchema?.items) {
    console.warn(`Array schema or items is undefined for section: ${section}`);
    return null;
  }

  return (
    <FieldArray
      name={section}
      render={arrayHelpers => (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {Object.entries(arraySchema.items || {}).map(([fieldKey, fieldSchema]: [string, any]) => (
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
              {Object.entries(arraySchema.items || {}).map(([fieldKey, fieldSchema]: [string, any]) => {
                const defaultValue = fieldSchema?.enum ? fieldSchema.enum[0] :
                  fieldSchema?.type === 'boolean' ? false :
                    fieldSchema?.type === 'number' ? 0 : '';

                const isExpression = fieldSchema?.type === 'expression' ||
                  (fieldSchema?.['ui-hint'] === 'expression') ||
                  (section === 'expressions' && fieldKey === 'expression') ||
                  (fieldKey === 'join_condition');

                return (
                  <Field name={`${section}.${index}.${fieldKey}`} key={fieldKey}>
                    {({ form }) => (
                      <Box sx={{ flex: 1 }}>
                        <FormField
                          fieldSchema={fieldSchema}
                          name={`${section}.${index}.${fieldKey}`}
                          fieldKey={fieldKey}
                          enumValues={fieldSchema?.enum}
                          value={field?.[fieldKey] ?? defaultValue}
                          isExpression={isExpression}
                          sourceColumns={sourceColumns}
                          onExpressionClick={() => {
                            if (isExpression) {
                              onExpressionClick(field?.name || fieldKey, form.setFieldValue, `${section}.${index}.${fieldKey}`);
                            }
                          }}
                        />
                      </Box>
                    )}
                  </Field>
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
              const emptyItem = Object.entries(arraySchema.items || {}).reduce(
                (acc, [key, value]: [string, any]) => ({
                  ...acc,
                  [key]: value?.enum ?
                    (value.default || value.enum[0]) :
                    value?.type === 'boolean' ? false : ''
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

const FormContent: React.FC<{
  schema: Schema,
  onExpressionClick: (targetColumn: string, setFieldValue: (field: string, value: any) => void, fieldName: string) => void,
  sourceColumns: SourceColumn[]
}> = ({ schema, onExpressionClick, sourceColumns }) => {
  const { values, setValues } = useFormikContext<FormValues>();
  const [activeTab, setActiveTab] = useState(0);

  const renderTabContent = (section: string, sectionSchema: any) => {
    return renderArrayFields(sectionSchema, values, section, onExpressionClick, sourceColumns);
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
              {schema.properties?.derived_fields ? renderArrayFields(schema.properties?.derived_fields, values, 'derived_fields', onExpressionClick, sourceColumns) : renderArrayFields(schema.properties?.sort_columns, values, 'sort_columns', onExpressionClick, sourceColumns)}
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {Object.entries(schema.properties).map(([key, value]: [string, any]) => (
              <Box key={key}>
                <h3>{key.replace(/_/g, ' ').toUpperCase()}</h3>
                <Field name={key}>
                  {({ form }) => (
                    <FormField
                      fieldSchema={value}
                      name={key}
                      fieldKey={key}
                      value={values[key]}
                      isExpression={value.type === 'expression'}
                      onExpressionClick={() => {
                        if (value.type === 'expression') {
                          onExpressionClick(key, form.setFieldValue, key);
                        }
                      }}
                    />
                  )}
                </Field>
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


import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Formik, Form, FieldArray, useFormikContext, Field } from 'formik';
import { Tabs, Tab, Box, Button, Stack, IconButton, Dialog, DialogContent, Typography } from '@mui/material';
import { commonTextFieldStyles, buttonStyles } from './styles/formStyles';
import { Schema, TabPanelProps } from './types/formTypes';
import { FormField } from './FormField';
import { useHotkeys } from 'react-hotkeys-hook';
import { ApiService } from '@/services/apiServices';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

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
  onClose?: () => void;
}

interface SourceColumn {
  name: string;
  dataType: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
  </div>
);

const safeArray = (value: any) => Array.isArray(value) ? value : [];

const fieldStyles = {
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0, // Prevents flex items from overflowing
  },
  select: {
    ...commonTextFieldStyles,
    width: '100%',
    height: '40px', // Adjust this value to match your other form fields
  }
};

const CreateFormFormik: React.FC<CreateFormProps> = ({ schema, onSubmit, initialValues, nodes, sourceColumns, onClose }) => {
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
            advanced: initialValues.advanced?.hints || [{
              join_input: '',
              hint_type: 'broadcast'
            }]
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

        case 'Repartition':
          return {
            repartition_type: initialValues?.repartition_type || 'repartition',
            repartition_value: initialValues?.repartition_value || '',
            override_partition: initialValues?.override_partition || '',
            repartition_expression: initialValues?.repartition_expression || [{
              expression: '',
              sort_order: '',
              order: 0
            }],
            limit: initialValues?.limit || ''
          };

        case 'Lookup':
          return {
            lookup_name: initialValues?.lookup_name || '',
            lookup_table: initialValues?.lookup_table || '',
            lookup_columns: initialValues?.lookup_columns || [{
              source_column: '',
              lookup_column: '',
              output_column: ''
            }],
            lookup_conditions: initialValues?.lookup_conditions || [{
              source_column: '',
              lookup_column: '',
              operator: '='
            }],
            broadcast_hint: initialValues?.broadcast_hint || false
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
      {({ values, setValues, setFieldValue }) => {
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
          onClose={onClose}
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
  if (!arraySchema || !arraySchema.items) {
    console.warn(`Invalid array schema for section ${section}`);
    return null;
  }

  const itemProperties = arraySchema.items.properties || arraySchema.items;
  const requiredFields = arraySchema.items.required || [];

  return (
    <FieldArray
      name={section}
      render={arrayHelpers => (
        <Box>
          {/* Header row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {Object.entries(itemProperties).map(([fieldKey, fieldSchema]: [string, any]) => (
              <Box key={fieldKey} sx={{ flex: 1 }}>
                <Box sx={{ mb: 1, fontWeight: 'bold' }}>
                  {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  {requiredFields.includes(fieldKey) && 
                    <span style={{ color: 'red' }}> *</span>}
                </Box>
              </Box>
            ))}
            {/* <Box sx={{ width: 40 }} /> */}
          </Box>

          {/* Array items */}
          {safeArray(values[section]).map((field: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {Object.entries(itemProperties).map(([fieldKey, fieldSchema]: [string, any]) => {
                const defaultValue = fieldSchema.enum ? fieldSchema.enum[0] :
                  fieldSchema.type === 'boolean' ? false :
                    fieldSchema.type === 'number' ? 0 : '';

                const isExpression = fieldSchema?.type === 'expression' ||
                  (fieldSchema?.['ui-hint'] === 'expression') ||
                  (section === 'expressions' && fieldKey === 'expression') ||
                  (fieldKey === 'join_condition');

                return (
                  <Field name={`${section}.${index}.${fieldKey}`} key={fieldKey}>
                    {({ form }) => (
                      <Box sx={{ flex: 1 }}>
                        <FormField
                          fieldSchema={{ 
                            type: fieldSchema.type || 'select',
                            enum: fieldSchema.enum || ['asc', 'desc'],
                            title: fieldSchema.title || '',
                            properties: fieldSchema.properties || {}
                          }}
                          name={`${section}.${index}.${fieldKey}`}
                          fieldKey={fieldKey}
                          value={field[fieldKey] ?? defaultValue}
                          isExpression={isExpression}
                          sourceColumns={sourceColumns}
                          required={requiredFields.includes(fieldKey)}
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

          {/* Add button */}
          <Button
            onClick={() => {
              const emptyItem = Object.keys(itemProperties).reduce(
                (acc, key) => ({
                  ...acc,
                  [key]: itemProperties[key].enum ?
                    (itemProperties[key].default || itemProperties[key].enum[0]) :
                    itemProperties[key].type === 'boolean' ? false : ''
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
  sourceColumns: SourceColumn[],
  onClose?: () => void
}> = ({ schema, onExpressionClick, sourceColumns, onClose }) => {
  const { values, setValues, setFieldValue } = useFormikContext<FormValues>();
  const [activeTab, setActiveTab] = useState(0);

  // Add function to check if a field should be rendered based on conditions
  const shouldRenderField = (fieldKey: string, fieldSchema: any) => {
    if (schema.title === 'Repartition') {
      const repartitionType = values.repartition_type;
      
      // Find the matching condition in the schema
      const matchingCondition = schema.anyOf?.find(condition => 
        condition.if?.properties?.repartition_type?.const === repartitionType
      );

      if (matchingCondition) {
        // For fields that should only be shown for specific repartition types
        if (fieldKey === 'repartition_expression') {
          return ['hash_repartition', 'repartition_by_range'].includes(repartitionType);
        }

        // For repartition_value
        if (fieldKey === 'repartition_value') {
          return ['repartition', 'coalesce', 'hash_repartition', 'repartition_by_range'].includes(repartitionType);
        }
      }
    }
    
    return true;
  };

  // Update isFieldRequired function to handle conditional requirements
  const isFieldRequired = (fieldKey: string, fieldSchema?: any, parentKey?: string) => {
    // Check if we have the schema title and it matches Repartition
    if (schema.title === 'Repartition') {
      const repartitionType = values?.repartition_type || 'repartition';
      
      // Find the matching condition in the schema
      const matchingCondition = schema.anyOf?.find(condition => 
        condition.if?.properties?.repartition_type?.const === repartitionType
      );

      if (matchingCondition) {
        // Check if the field is required for this repartition type
        const requiredFields = matchingCondition.then?.required || [];
        return requiredFields.includes(fieldKey);
      }

      // Check top-level required fields
      if (Array.isArray(schema.required) && schema.required.includes(fieldKey)) {
        return true;
      }
    }

    // Handle other schema types...
    if (Array.isArray(schema.required) && schema.required.includes(fieldKey)) {
      return true;
    }

    // Check if the parent object has this field as required
    if (parentKey && schema.properties[parentKey]?.required?.includes(fieldKey)) {
      return true;
    }

    // Check nested required fields for objects
    if (fieldSchema?.required && Array.isArray(fieldSchema.required)) {
      return fieldSchema.required.includes(fieldKey);
    }

    return false;
  };

  // Function to render array container fields
  const renderArrayContainer = (fieldKey: string, fieldSchema: any, parentKey?: string) => {
    const isRequired = isFieldRequired(fieldKey, fieldSchema, parentKey);
    const description = fieldSchema.description;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {isRequired && <span style={{ color: 'red' }}> *</span>}
          {description && (
            <Tooltip title={description} placement="top">
              <InfoIcon sx={{ fontSize: 16, color: 'action.active', ml: 0.5, cursor: 'help' }} />
            </Tooltip>
          )}
        </Box>
        <FieldArray
          name={fieldKey}
          render={arrayHelpers => (
            <Box>
              {/* Header row */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {Object.entries(fieldSchema.items.properties).map(([itemKey, itemSchema]: [string, any]) => (
                  <Box key={itemKey} sx={{ flex: 1 }}>
                    <Box sx={{ fontWeight: 'bold' }}>
                      {itemKey.replace(/_/g, ' ').split(' ').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                      {fieldSchema.items.required?.includes(itemKey) && 
                        <span style={{ color: 'red' }}> *</span>}
                    </Box>
                  </Box>
                ))}
                <Box sx={{ width: 40 }} />
              </Box>

              {/* Array items */}
              {(values[fieldKey] || []).map((item: any, index: number) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  {Object.entries(fieldSchema.items.properties).map(([itemKey, itemSchema]: [string, any]) => {
                    const isExpression = itemSchema.type === 'expression' || 
                                       itemSchema['ui-hint'] === 'expression' ||
                                       (fieldKey === 'repartition_expression' && itemKey === 'expression');

                    return (
                      <Box key={itemKey} sx={{ flex: 1 }}>
                        <Field name={`${fieldKey}.${index}.${itemKey}`}>
                          {({ field, form }) => (
                            <FormField
                              fieldSchema={{ 
                                type: itemSchema.type ,
                                enum: itemSchema.enum ,
                                title: itemSchema.title ,
                                properties: itemSchema.properties   
                              }}
                              name={`${fieldKey}.${index}.${itemKey}`}
                              fieldKey={itemKey}
                              value={field.value}
                              enumValues={itemSchema.enum}
                              isExpression={isExpression}
                              sourceColumns={sourceColumns}
                              required={fieldSchema.items.required?.includes(itemKey)}
                              onExpressionClick={() => {
                                if (isExpression) {
                                  onExpressionClick(
                                    item.name || itemKey,
                                    form.setFieldValue,
                                    `${fieldKey}.${index}.${itemKey}`
                                  );
                                }
                              }}
                            />
                          )}
                        </Field>
                      </Box>
                    );
                  })}
                  <IconButton
                    onClick={() => arrayHelpers.remove(index)}
                    disabled={(values[fieldKey] || []).length <= 1}
                    sx={buttonStyles.removeButton}
                  >
                    <span>×</span>
                  </IconButton>
                </Box>
              ))}

              {/* Add button */}
              <Button
                onClick={() => {
                  const emptyItem = Object.keys(fieldSchema.items.properties).reduce(
                    (acc, key) => ({
                      ...acc,
                      [key]: fieldSchema.items.properties[key].enum ? 
                        fieldSchema.items.properties[key].enum[0] : 
                        fieldSchema.items.properties[key].type === 'number' ? 0 : ''
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
      </Box>
    );
  };

  // Add specific rendering for Dedupe arrays
  const renderDedupeArrays = (fieldKey: string, fieldSchema: any) => {
    const isRequired = isFieldRequired(fieldKey);
    
    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {fieldKey.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {isRequired && <span style={{ color: 'red' }}> *</span>}
        </Box>
        <FieldArray
          name={fieldKey}
          render={arrayHelpers => (
            <Box>
              {fieldKey === 'dedup_by' ? (
                // Render dedup_by as simple string array
                <Box>
                  {(values[fieldKey] || []).map((item: string, index: number) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Field name={`${fieldKey}.${index}`}>
                        {({ field }) => (
                          <FormField
                            fieldSchema={{ 
                              type: 'string',
                              title: '',
                              properties: {}
                            }}
                            name={`${fieldKey}.${index}`}
                            fieldKey={fieldKey}
                            value={field.value}
                            required={true}
                          />
                        )}
                      </Field>
                      <IconButton
                        onClick={() => arrayHelpers.remove(index)}
                        disabled={(values[fieldKey] || []).length <= 1}
                        sx={buttonStyles.removeButton}
                      >
                        <span>×</span>
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                // Render order_by with nested properties
                <Box>
                  {(values[fieldKey] || []).map((item: any, index: number) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Field name={`${fieldKey}.${index}.order_column`}>
                        {({ field }) => (
                          <FormField
                            fieldSchema={{ 
                              type: 'string',
                              title: '',
                              properties: {}
                            }}
                            name={`${fieldKey}.${index}.order_column`}
                            fieldKey="order_column"
                            value={field.value}
                            required={true}
                          />
                        )}
                      </Field>
                      <Field name={`${fieldKey}.${index}.sort`}>
                        {({ field }) => (
                          <FormField
                            fieldSchema={{ 
                              type: 'select',
                              enum: ['asc', 'desc'],
                              title: '',
                              properties: {}
                            }}
                            name={`${fieldKey}.${index}.sort`}
                            fieldKey="sort"
                            value={field.value}
                            required={true}
                          />
                        )}
                      </Field>
                      <IconButton
                        onClick={() => arrayHelpers.remove(index)}
                        disabled={(values[fieldKey] || []).length <= 1}
                        sx={buttonStyles.removeButton}
                      >
                        <span>×</span>
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              <Button
                onClick={() => {
                  const emptyItem = fieldKey === 'dedup_by' ? 
                    '' : 
                    { order_column: '', sort: 'asc' };
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
      </Box>
    );
  };

  // Update renderField to handle boolean type fields
  const renderField = (key: string, value: any, parentKey?: string) => {
    if (!shouldRenderField(key, value)) {
      return null;
    }

    // Special handling for Dedupe arrays
    if (schema.title === 'Dedupe' && (key === 'dedup_by' || key === 'order_by')) {
      return renderDedupeArrays(key, value);
    }

    const isRequired = isFieldRequired(key, value, parentKey);
    const description = value.description;

    // Handle boolean type fields
    if (value.type === 'boolean') {
      return (
        <Box sx={fieldStyles.fieldContainer}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            <Field name={key}>
              {({ field }) => (
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value}
                />
              )}
            </Field>
            <Box sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {key.replace(/_/g, ' ').split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
              {isRequired && <span style={{ color: 'red' }}> *</span>}
              {description && (
                <Tooltip title={description} placement="top">
                  <InfoIcon sx={{ fontSize: 16, color: 'action.active', ml: 0.5, cursor: 'help' }} />
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      );
    }

    // Handle array container type
    if (value.type === 'array-container') {
      return renderArrayContainer(key, value, parentKey);
    }

    // Special handling for select type fields
    if (value.type === 'select') {
      return (
        <Box sx={fieldStyles.fieldContainer}>
          <Box sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {key.replace(/_/g, ' ').split(' ').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
            {isRequired && <span style={{ color: 'red' }}> *</span>}
            {description && (
              <Tooltip title={description} placement="top">
                <InfoIcon sx={{ fontSize: 16, color: 'action.active', ml: 0.5, cursor: 'help' }} />
              </Tooltip>
            )}
          </Box>
          <Field name={key}>
            {({ field }) => (
              <select
                {...field}
                style={fieldStyles.select}
                onChange={(e) => {
                  setFieldValue(key, e.target.value);
                }}
              >
                {value.enum.map((option: string) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, ' ').split(' ').map(word =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </Box>
      );
    }

    // Regular field rendering
    return (
      <Box sx={fieldStyles.fieldContainer}>
        <Box sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {key.replace(/_/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {isRequired && <span style={{ color: 'red' }}> *</span>}
          {description && (
            <Tooltip title={description} placement="top">
              <InfoIcon sx={{ fontSize: 16, color: 'action.active', ml: 0.5, cursor: 'help' }} />
            </Tooltip>
          )}
        </Box>
        <Field name={key}>
          {({ form }) => (
            <FormField
              fieldSchema={{ 
                type: value.type || 'select',
                enum: value.enum || ['asc', 'desc'],
                title: value.title || '',
                properties: value.properties || {}
              }}
              name={key}
              fieldKey={key}
              value={values[key]}
              isExpression={value.type === 'expression'}
              enumValues={value.enum}
              required={isRequired}
              onExpressionClick={() => {
                if (value.type === 'expression') {
                  onExpressionClick(key, form.setFieldValue, key);
                }
              }}
            />
          )}
        </Field>
      </Box>
    );
  };

  // Update renderFieldsInRows to handle required fields in tabs
  const renderFieldsInRows = (properties: Record<string, any>, parentKey?: string) => {
    const fields = Object.entries(properties)
      .filter(([key, value]) => shouldRenderField(key, value));

    let currentRow: [string, any][] = [];
    const rows: [string, any][][] = [];

    fields.forEach(([key, value]) => {
      // Check if field should be full width
      if (value.type === 'array' || 
          value.type === 'object' || 
          value.type === 'array-container' ||
          value.ui_type === 'full-width') {  // Add this condition
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
        rows.push([[key, value]]);
      } else {
        currentRow.push([key, value]);
        if (currentRow.length === 3) {
          rows.push(currentRow);
          currentRow = [];
        }
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows.map((row, rowIndex) => (
      <Box 
        key={rowIndex} 
        sx={{ 
          display: 'flex', 
          gap: 1,
          mb: 1,
          '& > *': { flex: 1 }
        }}
      >
        {row.map(([key, value]) => (
          <Box key={key} sx={{ 
            width: (value.ui_type === 'full-width' || 
                   value.type === 'array' || 
                   value.type === 'object' || 
                   value.type === 'array-container') ? '100%' : undefined 
          }}>
            {renderField(key, value, parentKey)}
          </Box>
        ))}
        {row.length < 3 && 
         row[0][1].ui_type !== 'full-width' &&  // Fix the comparison operator
         row[0][1].type !== 'array' && 
         row[0][1].type !== 'object' && 
         row[0][1].type !== 'array-container' && 
         [...Array(3 - row.length)].map((_, i) => (
          <Box key={`empty-${i}`} />
        ))}
      </Box>
    ));
  };

  // Update renderTabContent to pass parent key
  const renderTabContent = (key: string, value: any) => {
    if (value.type === 'array') {
      return renderArrayFields(value, values, key, onExpressionClick, sourceColumns);
    } else if (value.type === 'object') {
      return renderFieldsInRows(value.properties, key);
    } else {
      return renderField(key, value, key);
    }
  };

  return (
    <Form>
      <Box sx={{ width: '100%' }}>
        {/* Reduced margin bottom for close button container */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
        }}>
          <Typography variant="h6">{schema.title}</Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'grey.500',
              padding: '4px',
              '&:hover': {
                color: 'grey.700'
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>×</span>
          </IconButton>
        </Box>

        {schema.ui_type === 'tab-container' ? (
          <>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                minHeight: '36px',
                '& .MuiTab-root': {
                  minHeight: '36px',
                  padding: '6px 12px'
                },
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
          <Stack spacing={1}>
            {renderFieldsInRows(schema.properties)}
          </Stack>
        )}

        <Box sx={{ mt: 2 }}>
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


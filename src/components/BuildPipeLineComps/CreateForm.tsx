import React, { useState, useMemo, useCallback } from 'react';
import { Formik, Form, FieldArray, useFormikContext } from 'formik';
import { Tabs, Tab, Box, Button, Stack, IconButton } from '@mui/material';
import { commonTextFieldStyles, buttonStyles } from './styles/formStyles';
import { Schema, CreateFormProps, TabPanelProps } from './types/formTypes';
import { FormField } from './FormField';

type ArraySchema = {
  items: Record<string, any>;
  minItems?: number;
};

type FormValues = Record<string, any>;

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const CreateFormFormik: React.FC<CreateFormProps> = ({ schema, onSubmit, initialValues }) => {
  const generateInitialValues = useCallback((schema: Schema): FormValues => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      return initialValues as FormValues;
    }

    const createDefaultValue = (schema: any) => {
      if (schema.type === 'object') {
        return Object.entries(schema.properties).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: createDefaultValue(value)
        }), {});
      }
      
      if (schema.type === 'array') {
        const emptyItem = createDefaultValue(schema.items);
        return Array(schema.minItems || 1).fill(null).map(() => ({...emptyItem}));
      }

      if (schema.enum && schema.enum.length > 0) {
        return schema.default || schema.enum[0];
      }

      if (schema.name === 'join_type') {
        return schema.default || 'inner';
      }

      return schema.type === 'boolean' ? false :
             schema.type === 'number' ? 0 : '';
    };

    return createDefaultValue(schema) as FormValues;
  }, [initialValues]);

  const initialFormValues = useMemo(() => generateInitialValues(schema), [schema, generateInitialValues]);

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <Formik
      initialValues={initialFormValues}
      onSubmit={handleSubmit}
      enableReinitialize={true}
      validateOnBlur={true}
      validateOnChange={false}
    >
      <FormContent schema={schema} />
    </Formik>
  );
};

const renderArrayFields = (arraySchema: ArraySchema, values: FormValues, section: string) => {
  return (
    <FieldArray
      name={section}
      render={arrayHelpers => (
        <Box>
          {(values[section] || [])?.map((field: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {Object.entries(arraySchema.items).map(([fieldKey, fieldSchema]: [string, any]) => {
                const defaultValue = fieldSchema.enum ? fieldSchema.enum[0] : 
                                   fieldSchema.type === 'boolean' ? false :
                                   fieldSchema.type === 'number' ? 0 : '';
                
                return (
                  <Box key={fieldKey} sx={{ flex: 1 }}>
                    <FormField
                      fieldSchema={fieldSchema}
                      name={`${section}.${index}.${fieldKey}`}
                      fieldKey={fieldKey}
                      enumValues={fieldSchema.enum}
                      value={field[fieldKey] ?? defaultValue}
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
              {renderArrayFields(schema.properties.derived_fields, values, 'derived_fields')}
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

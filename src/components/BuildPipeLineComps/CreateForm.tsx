import React, { useState, useMemo } from 'react';
import { Formik, Form, FieldArray, useFormikContext, Field } from 'formik';
import { Tabs, Tab, Box, Button, TextField, IconButton, Stack } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Add this interface at the top of your CreateForm file
interface CreateFormProps {
  schema: any;
  onSubmit: (data: any) => void;
  initialValues?: any;
}

const CreateFormFormik: React.FC<CreateFormProps> = ({ schema, onSubmit, initialValues }) => {
  const generateInitialValues = () => {
    console.log(initialValues)
    // Check if initialValues exists and is not empty
    if (initialValues && Object.keys(initialValues).length > 0) {
      return initialValues;
    }
    console.log(schema.ui_type)

    // Generate default values based on schema
    const defaultValues: any = {};
    
    if (schema.ui_type === 'array-container') {
      defaultValues.derived_fields = [{
        name: '',
        expression: '',
        // Add any other fields that might exist in your schema
      }];
    } else if (schema.ui_type === 'tab-container') {
      // Handle tab container type
      Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
        defaultValues[key] = {
          derived_fields: [{
            name: '',
            expression: '',
            // Add any other fields that might exist in your schema
          }]
        };
      });
    } else {
      // Handle regular fields
      Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
        if (value.type === 'object' && value.properties?.derived_fields) {
          defaultValues[key] = {
            derived_fields: [{
              name: '',
              expression: '',
              // Add any other fields that might exist in your schema
            }]
          };
        } else {
          defaultValues[key] = ''; // Provide empty string for simple fields
        }
      });
    }
    
    return defaultValues;
  };

  const initialFormValues = useMemo(() => generateInitialValues(), [schema, initialValues]);

  return (
    <Formik
      initialValues={initialFormValues}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      <FormContent schema={schema} />
    </Formik>
  );
};

// New component to handle form content
const FormContent: React.FC<{ schema: any }> = ({ schema }) => {
  const { values } = useFormikContext();
  const [activeTab, setActiveTab] = useState(0);

  const renderField = (fieldSchema: any, name: string, fieldKey: string) => {
    const uiType = fieldSchema.ui_type || fieldSchema.type;
    
    // Common TextField styles
    const commonSx = {
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        transition: 'all 0.2s ease-in-out',
        borderRadius: '8px',
        '&:hover': {
          backgroundColor: 'rgba(241, 245, 249, 0.9)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
        '&.Mui-focused': {
          backgroundColor: '#ffffff',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(203, 213, 225, 0.4)',
        transition: 'all 0.2s ease-in-out',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(203, 213, 225, 0.8)',
      },
      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: '1px',
      },
      '& .MuiInputLabel-root': {
        color: 'rgba(0, 0, 0, 0.6)',
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: 'rgba(0, 0, 0, 0.8)',
      },
      '& .MuiInputBase-input': {
        padding: '10px 14px',
      },
    };

    switch (uiType) {
      case 'expression':
        return (
          <Field name={name}>
            {({ field }: any) => (
              <TextField 
                {...field}
                size='small'
                placeholder={`Enter ${fieldKey}`}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                sx={{
                  ...commonSx,
                  '& .MuiOutlinedInput-root': {
                    ...commonSx['& .MuiOutlinedInput-root'],
                    backgroundColor: 'rgba(249, 250, 251, 0.9)',
                  }
                }}
              />
            )}
          </Field>
        );
      default:
        return (
          <Field name={name}>
            {({ field }: any) => (
              <TextField 
                {...field}
                size='small'
                placeholder={`Enter ${fieldKey}`}
                fullWidth
                required={fieldSchema.required}
                helperText={fieldSchema.description}
                variant="outlined"
                sx={commonSx}
              />
            )}
          </Field>
        );
    }
  };

  const renderArrayFields = (arraySchema: any, values: any, section: string) => {
    // console.log(values[section])
    // console.log(values)
    // console.log(section)
    console.log(arraySchema)
    return ( <>
    <FieldArray
      name={`${section}.derived_fields`}
      render={arrayHelpers => (
        <Box>
          {values[section]?.derived_fields.map((field: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {Object.entries(arraySchema.items?.properties).map(([fieldKey, fieldSchema]: [string, any]) => (
                <Box key={fieldKey} sx={{ flex: 1 }}>
                  {renderField(
                    fieldSchema,
                    `${section}.derived_fields.${index}.${fieldKey}`,fieldKey
                  )}
                </Box>
              ))}
              <IconButton
                onClick={() => arrayHelpers.remove(index)}
                disabled={values[section].derived_fields.length <= arraySchema.minItems}
                sx={{
                  width: '28px',
                  height: '28px',
                  minWidth: '28px',
                  color: '#94a3b8',
                  backgroundColor: '#f1f5f9',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#ef4444',
                    color: 'white',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  '&:disabled': {
                    backgroundColor: '#f1f5f9',
                    color: '#cbd5e1',
                    transform: 'none',
                  },
                  borderRadius: '6px',
                }}
              >
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: '500',
                  lineHeight: 1,
                  marginTop: '-2px'
                }}>
                  ×
                </span>
              </IconButton>
            </Box>
          ))}
          <Button sx={{textTransform: 'none',color: 'green',fontWeight: 'bold'}}
            startIcon={<img src={'/assets/plus-circle.svg'} alt="Add" />}
            onClick={() => {
              const emptyItem = Object.keys(arraySchema.items.properties).reduce(
                (acc, key) => ({ ...acc, [key]: '' }),
                {}
              );
              arrayHelpers.push(emptyItem);
            }}
          >
            Add Field
          </Button>
        </Box>
      )}
    />
    </>)
  };
  const renderArrayContainerFields = (arraySchema: any, values: any) => {
    const derivedFieldsSchema = arraySchema?.properties?.derived_fields;
    if (!derivedFieldsSchema || !derivedFieldsSchema.items) {
      console.error("Invalid schema format.");
      return null;
    }
    
    const fieldProperties = derivedFieldsSchema.items.properties;
    
    return (
      <FieldArray
        name="derived_fields"
        render={arrayHelpers => (
          <Box>
            {(values.derived_fields || []).map((field: any, index: number) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {Object.entries(fieldProperties).map(([fieldKey, fieldSchema]: [string, any]) => (
                  <Box key={fieldKey} sx={{ flex: 1 }}>
                    {renderField(
                      fieldSchema,
                      `derived_fields.${index}.${fieldKey}`,
                      fieldKey
                    )}
                  </Box>
                ))}
                <IconButton
                  onClick={() => arrayHelpers.remove(index)}
                  disabled={values.derived_fields.length <= derivedFieldsSchema.minItems}
                  sx={{
                    width: '28px',
                    height: '28px',
                    minWidth: '28px',
                    color: '#94a3b8',
                    backgroundColor: '#f1f5f9',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#ef4444',
                      color: 'white',
                      transform: 'scale(1.05)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                    '&:disabled': {
                      backgroundColor: '#f1f5f9',
                      color: '#cbd5e1',
                      transform: 'none',
                    },
                    borderRadius: '6px',
                  }}
                >
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: '500',
                    lineHeight: 1,
                    marginTop: '-2px'
                  }}>
                    ×
                  </span>
                </IconButton>
              </Box>
            ))}
            <Button sx={{textTransform: 'none',color: 'green',fontWeight: 'bold'}}
            startIcon={<img src={'/assets/plus-circle.svg'} alt="Add" />}
              onClick={() => {
                const emptyItem = Object.keys(fieldProperties).reduce(
                  (acc, key) => ({ ...acc, [key]: '' }),
                  {}
                );
                arrayHelpers.push(emptyItem);
              }}
            >
              Add Field
            </Button>
          </Box>
        )}
      />
    );
  };
  


  const renderTabContent = (section: string, sectionSchema: any) => {
    console.log(section)
    return (
      <Box>
        {Object.entries(sectionSchema.properties).map(([_, value]: [string, any]) => {
          if (value.type === 'array') {
            return renderArrayFields(value, values, section);
          }
          return null;
        })}
      </Box>
    );
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
                  sx={{textTransform: 'none'}} 
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
        ) :schema.ui_type === 'array-container' ? (
          <Stack spacing={2}>
            {/* {Object.entries(schema.properties).map(([key, value]: [string, any]) => ( */}
              <Box >
                {/* <h3>{key.replace(/_/g, ' ').toUpperCase()}</h3> */}
                {/* {renderArrayFields(value, values, key)} */}

                {renderArrayContainerFields(schema,values)}
              </Box>
            {/* ))} */}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {Object.entries(schema.properties).map(([key, value]: [string, any]) => (
              <Box key={key}>
                <h3>{key.replace(/_/g, ' ').toUpperCase()}</h3>
                {renderField(value, key,key)}
              </Box>
            ))}
          </Stack>
        )}

        <Box sx={{ mt: 3 }}>
          <Button 
            sx={{
              textTransform: 'none',
              backgroundColor: '#000000',
              '&:hover': {
                backgroundColor: '#424242',
              },
            }} 
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

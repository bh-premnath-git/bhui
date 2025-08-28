import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Node, Edge } from '@xyflow/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LookupDataTable } from './LookupDataTable';
import { LookupColumnsTable } from './LookupColumnsTable';
import { SourceSelector } from './SourceSelector';
import { FormField } from './FormField';
import { generateInitialValues } from './get-initial-form';
// Import removed - using static schema instead

interface SourceColumn {
  name: string;
  dataType: string;
}

interface LookupFormValues {
  name?: string;
  transformation?: string;
  lookup_type: string;
  lookup_config: {
    name: string;
    source: any;
    read_options: {
      header: boolean;
    };
  };
  lookup_data: any[];
  lookup_columns: Array<{
    column: string;
    out_column_name: string;
  }>;
  lookup_conditions: {
    column_name: string;
    lookup_with: string;
  };
  keep: string;
  dependent_on?: string[];
}

interface LookupFormProps {
  onSubmit: (values: LookupFormValues) => void;
  initialValues?: Partial<LookupFormValues>;
  nodes: Node[];
  sourceColumns: SourceColumn[];
  formId?: string;
  onClose?: () => void;
  currentNodeId: string;
  edges: Edge[];
  isDialog?: boolean;
}

const LookupForm: React.FC<LookupFormProps> = ({
  onSubmit,
  initialValues,
  nodes,
  sourceColumns,
  onClose,
  currentNodeId,
  edges,
  formId
}) => {
  console.log(`🎯 LookupForm initialized with formId: ${formId}, currentNodeId: ${currentNodeId}`);
  
  // Static lookup schema based on the schema found in Filter.json
  const lookupSchema = useMemo(() => {
    return {
      title: 'Lookup',
      type: 'object',
      properties: {
        lookup_type: {
          type: 'string',
          enum: ['Column Based', 'Literal'],
          description: 'The type of lookup to perform.'
        },
        lookup_config: {
          type: 'object',
          description: 'Configuration for reading the lookup data (only for Column Based lookup).',
          properties: {
            name: {
              type: 'string',
              description: 'The name of the lookup configuration.'
            },
            source: {
              type: 'object',
              description: 'Reference to the source of the lookup data.'
            },
            read_options: {
              type: 'object',
              properties: {
                header: {
                  type: 'boolean',
                  description: 'Whether the lookup data has a header row.'
                }
              }
            }
          }
        },
        lookup_data: {
          type: 'array',
          description: 'Literal data for lookup (only for Literal lookup).',
          items: {
            type: 'object'
          }
        },
        lookup_conditions: {
          type: 'object',
          description: 'Conditions for joining the main DataFrame with the lookup DataFrame.',
          properties: {
            column_name: {
              type: 'string',
              description: 'The column in the main DataFrame to join on.'
            },
            lookup_with: {
              type: 'string',
              description: 'The column in the lookup DataFrame to join with.'
            }
          },
          required: ['column_name', 'lookup_with']
        },
        lookup_columns: {
          type: 'array',
          description: 'Columns to select from the lookup DataFrame.',
          items: {
            type: 'object',
            properties: {
              column: {
                type: 'string',
                description: 'The column name in the lookup DataFrame.'
              },
              out_column_name: {
                type: 'string',
                description: 'The output column name in the result DataFrame.'
              }
            },
            required: ['column', 'out_column_name']
          }
        },
        keep: {
          type: 'string',
          enum: ['First', 'Last', 'All'],
          description: 'Specifies which rows to keep when there are multiple matches in the lookup.'
        }
      },
      required: [
        'lookup_columns',
        'lookup_type',
        'lookup_conditions'
      ]
    };
  }, []);

  // Initialize form values specific to Lookup
  const initialFormValues = useMemo(() => {
    const baseValues = generateInitialValues(lookupSchema, initialValues, currentNodeId);
    
    // Properly merge lookup_config with existing values
    const defaultLookupConfig = { 
      name: '', 
      source: {},
      read_options: {
        header: true
      }
    };
    
    const mergedLookupConfig = initialValues?.lookup_config ? {
      name: initialValues.lookup_config.name || defaultLookupConfig.name,
      source: initialValues.lookup_config.source || defaultLookupConfig.source,
      read_options: {
        header: initialValues.lookup_config.read_options?.header ?? defaultLookupConfig.read_options.header
      }
    } : defaultLookupConfig;
    
    // Properly merge lookup_conditions with existing values
    const defaultLookupConditions = {
      column_name: '',
      lookup_with: ''
    };
    
    const mergedLookupConditions = initialValues?.lookup_conditions ? {
      column_name: initialValues.lookup_conditions.column_name || defaultLookupConditions.column_name,
      lookup_with: initialValues.lookup_conditions.lookup_with || defaultLookupConditions.lookup_with
    } : defaultLookupConditions;
    
    console.log('🔧 LookupForm lookup_conditions debug:', {
      'initialValues.lookup_conditions': initialValues?.lookup_conditions,
      'mergedLookupConditions': mergedLookupConditions
    });
    
    return {
      name: initialValues?.name || '',
      transformation: 'Lookup',
      lookup_type: initialValues?.lookup_type || 'Column Based',
      lookup_config: mergedLookupConfig,
      lookup_data: initialValues?.lookup_data || [],
      lookup_columns: initialValues?.lookup_columns || [],
      lookup_conditions: mergedLookupConditions,
      keep: initialValues?.keep || 'First',
      dependent_on: initialValues?.dependent_on || [],
      ...baseValues
    };
  }, [lookupSchema, initialValues, currentNodeId]);



  // Form configuration
  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<LookupFormValues>({
    defaultValues: initialFormValues,
    mode: 'onChange',
  });

  // Reset form when initialValues change
  useEffect(() => {
    reset(initialFormValues);
  }, [reset, initialValues, currentNodeId]); // Use initialValues and currentNodeId instead of initialFormValues

  // Watch form values
  const formValues = watch();
  const dispatch = useDispatch<AppDispatch>();
  const { pipelineDtl } = useSelector((state: RootState) => state.buildPipeline);

  // State for active tab
  const [activeTab, setActiveTab] = useState(0);

  // Handle form submission
  const onFormSubmit = (data: LookupFormValues) => {
    console.log('🔧 LookupForm submitted with data:', data);
    // Ensure required fields that are not in UI are included
    const submissionData = {
      ...data,
      name: initialFormValues.name,
      transformation: 'Lookup',
      dependent_on: initialFormValues.dependent_on
    };
    console.log('LookupForm submitting:', submissionData);
    onSubmit(submissionData);
  };

  // Render field based on schema
  const renderField = useCallback((key: string, fieldSchema: any, control: any, fieldKey: string, columnSuggestions: string[] = []) => {
    // Ensure fieldKey is always a valid string
    const safeFieldKey = fieldKey || key || 'unknown_field';
    
    if (!safeFieldKey || safeFieldKey === 'unknown_field') {
      console.warn('Invalid fieldKey in renderField:', { key, fieldKey, fieldSchema });
      return <div>Invalid field configuration</div>;
    }
    
    return (
      <FormField
        key={safeFieldKey}
        fieldKey={safeFieldKey}
        fieldSchema={fieldSchema}
        name={safeFieldKey}
        value={(() => {
          const watchedValue = watch(safeFieldKey as keyof LookupFormValues);
          if (Array.isArray(watchedValue)) {
            return watchedValue.join(', ');
          }
          if (typeof watchedValue === 'object' && watchedValue !== null) {
            return JSON.stringify(watchedValue);
          }
          return String(watchedValue || '');
        })()}
        onChange={(value) => setValue(safeFieldKey as keyof LookupFormValues, value)}
        control={control}
        formInitialValues={initialFormValues}
        columnSuggestions={columnSuggestions}
        setValue={setValue}
      />
    );
  }, [initialFormValues, setValue, watch]);

  // Render tab content for lookup-specific fields
  const renderTabContent = useCallback((key: string, value: any, control: any, formInitialValues = {}, columnSuggestions: string[] = [], setValue: any) => {
    if (!key || !value || typeof value !== 'object') {
      console.warn(`renderTabContent: Invalid key or value - key: ${key}, value:`, value);
      return <div>Invalid field configuration for {key || 'unknown'}</div>;
    }
    
    // Special handling for lookup_data field
    if (key === 'lookup_data' && value.type === 'array') {
      return (
        <div className="space-y-4">
          <Controller
            name="lookup_data"
            control={control}
            render={({ field }) => (
              <LookupDataTable
                value={field.value || []}
                onChange={field.onChange}
                disabled={false}
              />
            )}
          />
        </div>
      );
    }

    // Special handling for lookup_columns field
    if (key === 'lookup_columns' && value.type === 'array') {
      const currentLookupType = watch('lookup_type');
      const lookupData = watch('lookup_data');
      const lookupConfig = watch('lookup_config');
      
      return (
        <div className="space-y-4">
          <Controller
            name="lookup_columns"
            control={control}
            render={({ field }) => (
              <LookupColumnsTable
                value={field.value || []}
                onChange={field.onChange}
                availableColumns={[]}
                disabled={false}
                selectedSource={lookupConfig?.source}
                lookupType={currentLookupType}
                lookupData={lookupData}
                onLookupDataChange={(newData) => setValue('lookup_data', newData)}
              />
            )}
          />
        </div>
      );
    }

    // Special handling for lookup_config field
    if (key === 'lookup_config' && value.type === 'object') {
      return (
        <div className="space-y-4">
          <Controller
            name="lookup_config.source"
            control={control}
            render={({ field }) => (
              <SourceSelector
                value={field.value || {}}
                onChange={field.onChange}
                disabled={false}
              />
            )}
          />
          
          {/* Other lookup config fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration Name
              </Label>
              <Controller
                name="lookup_config.name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter configuration name"
                    className="w-full"
                  />
                )}
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Has Header
              </Label>
              <Controller
                name="lookup_config.read_options.header"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="header-checkbox"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="header-checkbox" className="text-sm text-gray-700">
                      First row contains headers
                    </Label>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      );
    }

    // Handle lookup_conditions field
    if (key === 'lookup_conditions' && value.type === 'object') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Column Name
              </Label>
              <Controller
                name="lookup_conditions.column_name"
                control={control}
                render={({ field }) => {
                  console.log('🔧 lookup_conditions.column_name field value:', field.value);
                  return (
                    <Input
                      {...field}
                      placeholder="Enter column name"
                      className="w-full"
                    />
                  );
                }}
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Lookup With
              </Label>
              <Controller
                name="lookup_conditions.lookup_with"
                control={control}
                render={({ field }) => {
                  console.log('🔧 lookup_conditions.lookup_with field value:', field.value);
                  return (
                    <Input
                      {...field}
                      placeholder="Enter lookup column"
                      className="w-full"
                    />
                  );
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    // Default field rendering
    if (value.type === 'object' && value.properties) {
      return (
        <div className="space-y-4">
          {Object.entries(value.properties).map(([subKey, subValue]) => (
            <div key={subKey}>
              {renderField(subKey, subValue, control, `${key || 'unknown'}.${subKey}`, columnSuggestions)}
            </div>
          ))}
        </div>
      );
    }

    // For simple fields, render directly without FormField to avoid control conflicts
    if (value.type === 'string' && value.enum) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {key.replace(/_/g, ' ').split(' ').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Label>
          <Controller
            name={key as keyof LookupFormValues}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {value.enum.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      );
    }
    
    if (value.type === 'string') {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {key.replace(/_/g, ' ').split(' ').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Label>
          <Controller
            name={key as keyof LookupFormValues}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                className="w-full"
              />
            )}
          />
        </div>
      );
    }
    
    if (value.type === 'array' && value.items?.type === 'string') {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {key.replace(/_/g, ' ').split(' ').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Label>
          <Controller
            name={key as keyof LookupFormValues}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                placeholder={`Enter ${key.replace(/_/g, ' ')} (comma-separated)`}
                className="w-full"
              />
            )}
          />
        </div>
      );
    }
    
    // Fallback to basic rendering
    return <div>Unsupported field type: {value.type}</div>;
  }, [watch, setValue, renderField]);

  // Schema is now static, no loading needed

  // Filter tabs based on lookup_type
  const filteredTabs = useMemo(() => {
    return Object.entries(lookupSchema.properties || {}).filter(([key]) => {
      const currentLookupType = watch('lookup_type');
      if (key === 'lookup_data' && currentLookupType === 'Column Based') {
        return false; // Don't show lookup_data tab for Column Based
      }
      if (key === 'lookup_config' && currentLookupType === 'Literal') {
        return false; // Don't show lookup_config tab for Literal
      }
      return true;
    });
  }, [lookupSchema.properties, watch('lookup_type')]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <Tabs value={activeTab.toString()} onValueChange={(value) => setActiveTab(parseInt(value))}>
          <TabsList>
            {filteredTabs.map(([key], index) => (
              <TabsTrigger key={key} value={index.toString()}>
                {key.replace(/_/g, ' ').split(' ').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          {filteredTabs.map(([key, value]: [string, any], index) => (
            <TabsContent key={key || `tab-${index}`} value={index.toString()}>
              {key && value ? renderTabContent(key, value, control, initialFormValues, [], setValue) : <div>Invalid tab configuration</div>}
            </TabsContent>
          ))}
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            Save Lookup Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LookupForm;
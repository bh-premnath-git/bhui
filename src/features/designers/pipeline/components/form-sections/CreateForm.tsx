import React, { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

interface FormField {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  properties?: Record<string, any>;
  items?: any;
  enum?: string[];
  description?: string;
}

interface FormSchema {
  title?: string; // Make title optional to match JSONSchema4
  type: string;
  properties: Record<string, any>;
  required?: string[];
}

interface SourceColumn {
  name: string;
  dataType: string;
}

interface CreateFormProps {
  form_name: string;
  sourceColumns: SourceColumn[];
  onClose?: () => void;
  pipelineDtl?: any;
  currentNodeId: string;
  edges: Edge[];
  onSubmit: (values: any) => void;
}

const CreateForm: React.FC<CreateFormProps> = ({ 
  form_name, 
  sourceColumns, 
  onClose, 
  pipelineDtl, 
  currentNodeId, 
  edges,
  onSubmit
}) => {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  // Load the JSON schema based on form_name
  useEffect(() => {
    const loadSchema = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construct the path to the JSON file
        const jsonPath = `/src/components/bh-reactflow-comps/builddata/json/${form_name}.json`;
        
        // Dynamically import the JSON file
        const schemaModule = await import(`@/components/bh-reactflow-comps/builddata/json/${form_name}.json`);
        
        // Instead of using $RefParser.dereference which has Node.js dependencies,
        // we'll directly use the schema without dereferencing
        const schemaData = schemaModule.default;
        
        // Ensure the schema has all required properties for FormSchema
        const formattedSchema: FormSchema = {
          title: schemaData.title || form_name,
          type: schemaData.type || 'object',
          properties: schemaData.properties || {},
          required: schemaData.required
        };
        
        setSchema(formattedSchema);
        
        // Initialize form with default values if available
        if (formattedSchema.properties) {
          const defaultValues: Record<string, any> = {};
          
          Object.entries(formattedSchema.properties).forEach(([key, prop]: [string, any]) => {
            if (prop.default !== undefined) {
              defaultValues[key] = prop.default;
            } else if (prop.type === 'array') {
              defaultValues[key] = [];
            } else if (prop.type === 'object') {
              defaultValues[key] = {};
            }
          });
          
          reset(defaultValues);
        }
      } catch (err) {
        console.error('Error loading schema:', err);
        setError(`Failed to load form schema: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadSchema();
  }, [form_name, reset]);

  // Function to render form fields based on schema
  const renderFormFields = () => {
    if (!schema || !schema.properties) {
      return null;
    }
    
    // Organize properties into basic and advanced tabs
    const basicFields: FormField[] = [];
    const advancedFields: FormField[] = [];
    
    Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
      const isRequired = schema.required?.includes(key) || false;
      const field: FormField = {
        name: key,
        type: property.type,
        label: property.title || key,
        required: isRequired,
        properties: property,
        enum: property.enum,
        description: property.description
      };
      
      // Determine if field is advanced based on metadata or naming convention
      if (property.ui_category === 'advanced' || key.startsWith('advanced_') || key === 'dependent_on') {
        advancedFields.push(field);
      } else {
        basicFields.push(field);
      }
    });
    
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced" disabled={advancedFields.length === 0}>Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-4">
          {basicFields.map(field => renderField(field))}
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4 pt-4">
          {advancedFields.map(field => renderField(field))}
        </TabsContent>
      </Tabs>
    );
  };

  // Function to render individual form field based on its type
  const renderField = (field: FormField) => {
    const { name, type, label, required, properties, enum: options, description } = field;
    const fieldError = errors[name];
    
    switch (type) {
      case 'string':
        if (options && options.length > 0) {
          return (
            <div key={name} className="space-y-2">
              <Label htmlFor={name}>
                {label} {required && <span className="text-red-500">*</span>}
              </Label>
              <select
                id={name}
                {...register(name, { required: required })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Select {label}</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
              {fieldError && <p className="text-sm text-red-500">{fieldError.message as string}</p>}
            </div>
          );
        }
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={name}
              type="text"
              {...register(name, { required: required })}
            />
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {fieldError && <p className="text-sm text-red-500">{fieldError.message as string}</p>}
          </div>
        );
        
      case 'number':
      case 'integer':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={name}
              type="number"
              {...register(name, { 
                required: required,
                valueAsNumber: true 
              })}
            />
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {fieldError && <p className="text-sm text-red-500">{fieldError.message as string}</p>}
          </div>
        );
        
      case 'boolean':
        return (
          <div key={name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                id={name}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                {...register(name)}
              />
              <Label htmlFor={name}>
                {label} {required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {fieldError && <p className="text-sm text-red-500">{fieldError.message as string}</p>}
          </div>
        );
        
      case 'array':
        // For simplicity, we'll just render a textarea for arrays
        // In a real implementation, you'd want to handle arrays properly with add/remove functionality
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <textarea
              id={name}
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
              placeholder={`Enter ${label} as comma-separated values`}
              {...register(name, { required: required })}
            />
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {fieldError && <p className="text-sm text-red-500">{fieldError.message as string}</p>}
          </div>
        );
        
      default:
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={name}
              type="text"
              {...register(name, { required: required })}
            />
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {fieldError && <p className="text-sm text-red-500">{fieldError.message as string}</p>}
          </div>
        );
    }
  };
  
  // Handle form submission
  const onFormSubmit = (data: any) => {
    // Process the form data if needed
    const processedData = { ...data };
    
    // Convert string arrays (from textareas) to actual arrays if needed
    Object.entries(processedData).forEach(([key, value]) => {
      const fieldSchema = schema?.properties?.[key];
      if (fieldSchema?.type === 'array' && typeof value === 'string') {
        processedData[key] = value.split(',').map(item => item.trim()).filter(Boolean);
      }
    });
    
    // Call the onSubmit prop with the processed data
    onSubmit(processedData);
  };
  
  // Render the component
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{schema?.title || form_name}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {renderFormFields()}
            
            <div className="flex justify-end space-x-2 pt-4">
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button type="submit">
                Save
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

// Export the component
export default CreateForm;
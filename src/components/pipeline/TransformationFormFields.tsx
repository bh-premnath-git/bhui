import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getFieldType } from './transformationFormSchema';

interface TransformationFormFieldsProps {
  schema: {
    properties?: Record<string, any>;
    type?: string;
    title?: string;
    required?: string[];
  };
  form: any;
  parentKey?: string;
  mode?: 'edit' | 'new';
}

export function TransformationFormFields({ 
  schema, 
  form, 
  parentKey = '', 
  mode = 'new' 
}: TransformationFormFieldsProps) {
  if (!schema || !schema.properties) {
    return null;
  }

  // Helper function to determine if a field should be shown
  const shouldShowField = (key: string, field: any): boolean => {
    // Skip internal fields
    if (key.startsWith('_')) return false;
    
    // Always show type and task_id fields
    if (key === 'type' || key === 'task_id') return true;
    
    return true;
  };

  // Helper function to determine if a field is required
  const isFieldRequired = (key: string): boolean => {
    return schema.required?.includes(key) || key === 'type' || key === 'task_id';
  };

  // Helper function to get field description
  const getFieldDescription = (field: any): string => {
    return field.description || field.title || '';
  };

  // Render array field with add/remove functionality
  const renderArrayField = (key: string, field: any, fieldKey: string, formField: any, isRequired: boolean) => {
    const [showDescription, setShowDescription] = useState(false);
    const currentValue = formField.value || [];

    const addItem = () => {
      const newItem = field.items?.type === 'string' ? '' : 
                     field.items?.type === 'number' ? 0 : 
                     field.items?.type === 'object' ? {} : '';
      formField.onChange([...currentValue, newItem]);
    };

    const removeItem = (index: number) => {
      const newValue = currentValue.filter((_: any, i: number) => i !== index);
      formField.onChange(newValue);
    };

    const updateItem = (index: number, value: any) => {
      const newValue = [...currentValue];
      newValue[index] = value;
      formField.onChange(newValue);
    };

    return (
      <FormItem className="col-span-2 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FormLabel>
              {field.title || key}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            {field.description && (
              <button
                type="button"
                className="ml-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowDescription(!showDescription)}
              >
                <HelpCircle size={16} />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Item
          </Button>
        </div>
        
        {showDescription && field.description && (
          <FormDescription>{field.description}</FormDescription>
        )}

        <div className="space-y-2">
          {currentValue.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                {field.items?.type === 'string' ? (
                  <Input
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={field.items?.examples?.[0] || `Item ${index + 1}`}
                  />
                ) : field.items?.type === 'number' || field.items?.type === 'integer' ? (
                  <Input
                    type="number"
                    value={item}
                    onChange={(e) => updateItem(index, field.items?.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value))}
                    placeholder={`Item ${index + 1}`}
                  />
                ) : (
                  <Textarea
                    value={typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        updateItem(index, parsed);
                      } catch {
                        updateItem(index, e.target.value);
                      }
                    }}
                    placeholder={`Item ${index + 1}`}
                    className="font-mono"
                  />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {currentValue.length === 0 && (
            <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
              No items added yet. Click "Add Item" to get started.
            </div>
          )}
        </div>
        
        <FormMessage />
      </FormItem>
    );
  };

  // Render object field (like rename_columns)
  const renderObjectField = (key: string, field: any, fieldKey: string, formField: any, isRequired: boolean) => {
    const [showDescription, setShowDescription] = useState(false);
    const currentValue = formField.value || {};

    const addProperty = () => {
      const newKey = `key_${Object.keys(currentValue).length + 1}`;
      formField.onChange({
        ...currentValue,
        [newKey]: ''
      });
    };

    const removeProperty = (propKey: string) => {
      const newValue = { ...currentValue };
      delete newValue[propKey];
      formField.onChange(newValue);
    };

    const updatePropertyKey = (oldKey: string, newKey: string) => {
      if (oldKey === newKey) return;
      const newValue = { ...currentValue };
      newValue[newKey] = newValue[oldKey];
      delete newValue[oldKey];
      formField.onChange(newValue);
    };

    const updatePropertyValue = (propKey: string, value: string) => {
      formField.onChange({
        ...currentValue,
        [propKey]: value
      });
    };

    return (
      <FormItem className="col-span-2 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FormLabel>
              {field.title || key}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            {field.description && (
              <button
                type="button"
                className="ml-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowDescription(!showDescription)}
              >
                <HelpCircle size={16} />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addProperty}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Property
          </Button>
        </div>
        
        {showDescription && field.description && (
          <FormDescription>{field.description}</FormDescription>
        )}

        <div className="space-y-2">
          {Object.entries(currentValue).map(([propKey, propValue]: [string, any]) => (
            <div key={propKey} className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  value={propKey}
                  onChange={(e) => updatePropertyKey(propKey, e.target.value)}
                  placeholder="Property name"
                />
                <Input
                  value={propValue}
                  onChange={(e) => updatePropertyValue(propKey, e.target.value)}
                  placeholder="Property value"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeProperty(propKey)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {Object.keys(currentValue).length === 0 && (
            <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
              No properties added yet. Click "Add Property" to get started.
            </div>
          )}
        </div>
        
        <FormMessage />
      </FormItem>
    );
  };

  // Render password field with toggle
  const renderPasswordField = (key: string, field: any, fieldKey: string, formField: any, isRequired: boolean) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showDescription, setShowDescription] = useState(false);

    return (
      <FormItem className="w-full">
        <div className="flex items-center">
          <FormLabel>
            {field.title || key}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          {field.description && (
            <button
              type="button"
              className="ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => setShowDescription(!showDescription)}
            >
              <HelpCircle size={16} />
            </button>
          )}
        </div>
        {showDescription && field.description && (
          <FormDescription>{field.description}</FormDescription>
        )}
        <div className="relative">
          <FormControl>
            <Input
              {...formField}
              type={showPassword ? "text" : "password"}
              className="pr-10"
              placeholder={field.examples?.[0] || field.default || ''}
            />
          </FormControl>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <FormMessage />
      </FormItem>
    );
  };

  // Main field renderer
  const renderField = (key: string, field: any) => {
    if (!shouldShowField(key, field)) return null;

    const fieldKey = parentKey ? `${parentKey}.${key}` : key;
    const isRequired = isFieldRequired(key);
    const fieldType = getFieldType(field);
    const [showDescription, setShowDescription] = useState(false);

    return (
      <FormField
        key={fieldKey}
        control={form.control}
        name={fieldKey}
        render={({ field: formField }) => {
          // Handle different field types
          switch (fieldType) {
            case 'boolean':
              return (
                <FormItem className="w-full">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>
                        {field.title || key}
                        {isRequired && <span className="text-destructive ml-1">*</span>}
                      </FormLabel>
                      {field.description && (
                        <FormDescription>{field.description}</FormDescription>
                      )}
                    </div>
                    <FormControl>
                      <Switch
                        checked={formField.value === true || formField.value === "true"}
                        onCheckedChange={formField.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              );

            case 'select':
              return (
                <FormItem className="w-full">
                  <div className="flex items-center">
                    <FormLabel>
                      {field.title || key}
                      {isRequired && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    {field.description && (
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowDescription(!showDescription)}
                      >
                        <HelpCircle size={16} />
                      </button>
                    )}
                  </div>
                  {showDescription && field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <Select
                    value={formField.value?.toString() || ''}
                    onValueChange={formField.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.title || key}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {field.enum?.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );

            case 'number':
              return (
                <FormItem className="w-full">
                  <div className="flex items-center">
                    <FormLabel>
                      {field.title || key}
                      {isRequired && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    {field.description && (
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowDescription(!showDescription)}
                      >
                        <HelpCircle size={16} />
                      </button>
                    )}
                  </div>
                  {showDescription && field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormControl>
                    <Input
                      {...formField}
                      type="number"
                      step={field.type === 'integer' ? '1' : 'any'}
                      min={field.minimum}
                      max={field.maximum}
                      placeholder={field.examples?.[0]?.toString() || field.default?.toString() || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          formField.onChange(undefined);
                        } else {
                          const numValue = field.type === 'integer' ? parseInt(value) : parseFloat(value);
                          formField.onChange(isNaN(numValue) ? undefined : numValue);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );

            case 'textarea':
              return (
                <FormItem className="col-span-2 w-full">
                  <div className="flex items-center">
                    <FormLabel>
                      {field.title || key}
                      {isRequired && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    {field.description && (
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowDescription(!showDescription)}
                      >
                        <HelpCircle size={16} />
                      </button>
                    )}
                  </div>
                  {showDescription && field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormControl>
                    <Textarea
                      {...formField}
                      className="min-h-[100px] resize-y"
                      placeholder={field.examples?.[0] || field.default || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );

            case 'password':
              return renderPasswordField(key, field, fieldKey, formField, isRequired);

            case 'array':
              return renderArrayField(key, field, fieldKey, formField, isRequired);

            case 'object':
              return renderObjectField(key, field, fieldKey, formField, isRequired);

            default:
              // Regular text input
              return (
                <FormItem className="w-full">
                  <div className="flex items-center">
                    <FormLabel>
                      {field.title || key}
                      {isRequired && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    {field.description && (
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowDescription(!showDescription)}
                      >
                        <HelpCircle size={16} />
                      </button>
                    )}
                  </div>
                  {showDescription && field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormControl>
                    <Input
                      {...formField}
                      placeholder={field.examples?.[0] || field.default || ''}
                      minLength={field.minLength}
                      maxLength={field.maxLength}
                      pattern={field.pattern}
                      readOnly={key === 'type'} // Make type field read-only
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
          }
        }}
      />
    );
  };

  // Group fields by category or use default layout
  const fieldEntries = Object.entries(schema.properties);
  
  // Separate core fields (type, task_id) from others
  const coreFields = fieldEntries.filter(([key]) => key === 'type' || key === 'task_id');
  const otherFields = fieldEntries.filter(([key]) => key !== 'type' && key !== 'task_id');

  return (
    <div className="space-y-6">
      {/* Core Fields */}
      {coreFields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <Badge variant="outline">Required</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreFields.map(([key, field]) => renderField(key, field))}
          </div>
        </div>
      )}

      {/* Other Fields */}
      {otherFields.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherFields.map(([key, field]) => renderField(key, field))}
          </div>
        </div>
      )}
    </div>
  );
}
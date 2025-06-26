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
import { HelpCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ComputeClusterFormFieldsProps {
  schema: {
    properties?: Record<string, any>;
    type?: string;
    title?: string;
    required?: string[];
  };
  form: any;
  parentKey?: string;
  twoColumnLayout?: boolean;
  mode?: 'edit' | 'new';
  isLoading?: boolean;
  onComputeTypeChange?: (computeType: string) => void;
}

export function ComputeClusterFormFields({ 
  schema, 
  form, 
  parentKey = '', 
  twoColumnLayout = true, 
  mode = 'new',
  isLoading = false,
  onComputeTypeChange
}: ComputeClusterFormFieldsProps) {
  if (!schema || !schema.properties) {
    return null;
  }

  // Group fields by category if defined in schema
  const fieldsByCategory: Record<string, { key: string, field: any }[]> = {
    'General': []
  };

  Object.entries(schema.properties).forEach(([key, field]) => {
    const category = field.category || 'General';
    if (!fieldsByCategory[category]) {
      fieldsByCategory[category] = [];
    }
    fieldsByCategory[category].push({ key, field });
  });

  // Check if the field should take a full row
  const shouldUseFullWidth = (field: any, key?: string) => {
    // For basic config fields, all fields use single column in 4-col grid
    if (parentKey === '') {
      return false; // single column for all basic config fields
    }
    
    // For compute_config fields, use more conservative spanning
    if (parentKey === 'compute_config') {
      if (field.type === 'array') return true; // span all 3 cols for arrays
      const wideFields = ['aws_logs_uri', 'custom_image_uri', 'applications'];
      if (wideFields.includes(key)) return true; // span all 3 cols
      return false; // single column for most fields
    }
    
    if (field.format === 'textarea' || field.type === 'object' || field.type === 'array') {
      return true;
    }
    
    if (field.description && field.description.length > 100) {
      return true;
    }
    
    const fullWidthFields = ['aws_logs_uri', 'custom_image_uri'];
    return fullWidthFields.includes(key);
  };

  // Helper function to get the correct CSS class for field width
  const getFieldClassName = (field: any, key?: string) => {
    const isFullWidth = shouldUseFullWidth(field, key);
    if (isFullWidth) {
      return parentKey === 'compute_config' ? "col-span-3 w-full" : "col-span-2 w-full";
    }
    return "w-full";
  };

  const renderArrayField = (key: string, field: any, fieldKey: string, formField: any, isRequired: boolean) => {
    const [showDescription, setShowDescription] = useState(false);
    const currentValue = formField.value || [];

    // Handle array of objects (like tags)
    if (field.items?.type === 'object' && field.items?.properties) {
      console.log(`Rendering array of objects field: ${key}`, field.items.properties);
      const addObjectItem = () => {
        const newItem: any = {};
        Object.keys(field.items.properties).forEach(propKey => {
          newItem[propKey] = '';
        });
        formField.onChange([...currentValue, newItem]);
      };

      const removeObjectItem = (index: number) => {
        const newValue = currentValue.filter((_: any, i: number) => i !== index);
        formField.onChange(newValue);
      };

      const updateObjectItem = (index: number, propKey: string, value: any) => {
        const newValue = [...currentValue];
        newValue[index] = { ...newValue[index], [propKey]: value };
        formField.onChange(newValue);
      };

      return (
        <FormItem className={getFieldClassName(field, key)}>
          <div className="flex items-center">
            <FormLabel>
              {field.title || key}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            {field.description && (
              <button
                type="button"
                className="ml-1 text-muted-foreground"
                onClick={() => setShowDescription(!showDescription)}
              >
                <HelpCircle size={16} />
              </button>
            )}
          </div>
          {showDescription && field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          
          <div className="space-y-3">
            {currentValue.map((item: any, index: number) => (
              <div key={index} className="flex items-end gap-2 p-3 border rounded-lg">
                {Object.entries(field.items.properties).map(([propKey, propField]: [string, any]) => (
                  <div key={propKey} className="flex-1">
                    <FormLabel className="text-sm">{propField.title || propKey}</FormLabel>
                    <Input
                      value={item[propKey] || ''}
                      onChange={(e) => updateObjectItem(index, propKey, e.target.value)}
                      placeholder={propField.title || propKey}
                      className="mt-1"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeObjectItem(index)}
                  className="mb-0"
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addObjectItem}
              className="w-full"
            >
              <Plus size={16} className="mr-2" />
              Add {key === 'bh_tags' ? 'Tag' : field.title || key}
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      );
    }

    // Handle array of strings (like applications and security_group_ids)
    console.log(`Rendering string array field: ${key}`, { hasEnum: !!field.items?.enum, field });
    const [newItemValue, setNewItemValue] = useState('');
    
    const addItem = (item: string) => {
      if (item && !currentValue.includes(item)) {
        formField.onChange([...currentValue, item]);
        setNewItemValue(''); // Clear input after adding
      }
    };

    const removeItem = (index: number) => {
      const newValue = currentValue.filter((_: any, i: number) => i !== index);
      formField.onChange(newValue);
    };

    const handleAddFromInput = () => {
      if (newItemValue.trim()) {
        addItem(newItemValue.trim());
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddFromInput();
      }
    };

    return (
      <FormItem className={getFieldClassName(field, key)}>
        <div className="flex items-center">
          <FormLabel>
            {field.title || key}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          {field.description && (
            <button
              type="button"
              className="ml-1 text-muted-foreground"
              onClick={() => setShowDescription(!showDescription)}
            >
              <HelpCircle size={16} />
            </button>
          )}
        </div>
        {showDescription && field.description && (
          <FormDescription>{field.description}</FormDescription>
        )}
        
        <div className="space-y-2">
          {/* Selected items */}
          <div className="flex flex-wrap gap-2">
            {currentValue.map((item: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          
          {/* Add new item */}
          {field.items?.enum ? (
            // Dropdown for enum arrays (like applications)
            <Select onValueChange={addItem}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={`Select ${field.title || key} to add`} />
              </SelectTrigger>
              <SelectContent>
                {field.items.enum
                  .filter((option: string) => !currentValue.includes(option))
                  .map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            // Input field for free-form string arrays (like security_group_ids)
            <div className="flex gap-2">
              <Input
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Enter ${field.title || key}`}
                className="h-9 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFromInput}
                disabled={!newItemValue.trim()}
                className="h-9"
              >
                <Plus size={16} />
              </Button>
            </div>
          )}
        </div>
        <FormMessage />
      </FormItem>
    );
  };

  const renderField = (key: string, field: any) => {
    const fieldKey = parentKey ? `${parentKey}.${key}` : key;
    const isRequired = schema.required?.includes(key);
    const [showDescription, setShowDescription] = useState(false);

    // Skip internal fields
    if (key.startsWith('_')) {
      return null;
    }

    if (field.type === 'object' && field.properties) {
      return (
        <div key={fieldKey} className="space-y-4 col-span-2 w-full">
          <h3 className="text-lg font-semibold border-b pb-2">{field.title || key}</h3>
          <div className="p-4 rounded-lg border bg-muted/20">
            <ComputeClusterFormFields 
              schema={field} 
              form={form} 
              parentKey={fieldKey} 
              twoColumnLayout={twoColumnLayout}
              mode={mode}
            />
          </div>
        </div>
      );
    }

    // Handle array fields (like applications)
    if (field.type === 'array') {
      console.log(`Rendering array field: ${key}`, field);
      return (
        <FormField
          key={fieldKey}
          control={form.control}
          name={fieldKey}
          render={({ field: formField }) => 
            renderArrayField(key, field, fieldKey, formField, isRequired)
          }
        />
      );
    }

    // For regular form fields
    return (
      <FormField
        key={fieldKey}
        control={form.control}
        name={fieldKey}
        render={({ field: formField }) => {
          if (field.type === 'boolean') {
            return (
              <FormItem className={getFieldClassName(field, key)}>
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
          }

          if (field.enum) {
            // Show loading skeleton for compute_type or bh_env_id field when loading
            if (isLoading && (key === 'compute_type' || key === 'bh_env_id')) {
              return (
                <FormItem className={getFieldClassName(field, key)}>
                  <div className="flex items-center">
                    <FormLabel>
                      {field.title || key}
                      {isRequired && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                  </div>
                  <Skeleton className="h-10 w-full" />
                </FormItem>
              );
            }

            return (
              <FormItem className={getFieldClassName(field, key)}>
                <div className="flex items-center">
                  <FormLabel>
                    {field.title || key}
                    {isRequired && <span className="text-destructive ml-1">*</span>}
                    {mode === 'edit' && parentKey === '' && (key === 'compute_type' || key === 'bh_env_id' || key === 'compute_config_name') && (
                      <span className="text-xs text-muted-foreground ml-2">(Read-only)</span>
                    )}
                  </FormLabel>
                  {field.description && (
                    <button
                      type="button"
                      className="ml-1 text-muted-foreground"
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
                  onValueChange={(value) => {
                    formField.onChange(value);
                    // Call compute type change callback if this is the compute_type field
                    if (key === 'compute_type' && onComputeTypeChange) {
                      onComputeTypeChange(value);
                    }
                  }}
                  disabled={
                    (isLoading && (key === 'compute_type' || key === 'bh_env_id')) ||
                    (mode === 'edit' && parentKey === '' && (key === 'compute_type' || key === 'bh_env_id' || key === 'compute_config_name'))
                  }
                >
                  <FormControl>
                    <SelectTrigger className={`h-9 ${
                      mode === 'edit' && parentKey === '' && (key === 'compute_type' || key === 'bh_env_id' || key === 'compute_config_name')
                        ? 'bg-muted cursor-not-allowed opacity-70'
                        : ''
                    }`}>
                      <SelectValue placeholder={`Select ${field.title || key}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.enum
                      .filter((option: string) => option !== "")
                      .map((option: string, index: number) => (
                        <SelectItem key={option} value={option}>
                          {field.enumNames && field.enumNames[index] ? field.enumNames[index] : option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }

          if (field.format === 'textarea') {
            return (
              <FormItem className={getFieldClassName(field, key)}>
                <div className="flex items-center">
                  <FormLabel>
                    {field.title || key}
                    {isRequired && <span className="text-destructive ml-1">*</span>}
                  </FormLabel>
                  {field.description && (
                    <button
                      type="button"
                      className="ml-1 text-muted-foreground"
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
                    placeholder={field.examples?.[0] || field.default || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }
          
          return (
            <FormItem className={getFieldClassName(field, key)}>
              <div className="flex items-center">
                <FormLabel>
                  {field.title || key}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                  {mode === 'edit' && parentKey === '' && (key === 'compute_config_name' || key === 'tenant_key') && (
                    <span className="text-xs text-muted-foreground ml-2">(Read-only)</span>
                  )}
                </FormLabel>
                {field.description && (
                  <button
                    type="button"
                    className="ml-1 text-muted-foreground"
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
                  type={field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.examples?.[0] || field.default || ''}
                  value={formField.value || ''}
                  className={`h-9 ${
                    mode === 'edit' && parentKey === '' && (key === 'compute_config_name' || key === 'tenant_key')
                      ? 'bg-muted cursor-not-allowed opacity-70'
                      : ''
                  }`}
                  disabled={mode === 'edit' && parentKey === '' && (key === 'compute_config_name' || key === 'tenant_key')}
                  readOnly={mode === 'edit' && parentKey === '' && (key === 'compute_config_name' || key === 'tenant_key')}
                  onChange={(e) => {
                    const value = field.type === 'number' 
                      ? (e.target.value === '' ? '' : Number(e.target.value))
                      : e.target.value;
                    formField.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  };

  // Use different grid layouts based on context
  const gridLayout = parentKey === 'compute_config' ? "grid grid-cols-3 gap-3" : 
                    twoColumnLayout ? "grid grid-cols-2 gap-4" : "space-y-4";
  
  return (
    <div className={gridLayout}>
      {Object.entries(fieldsByCategory).map(([category, fields]) => (
        <div key={category} className={parentKey === 'compute_config' ? "col-span-3 space-y-2" : "col-span-2 space-y-3"}>
          {category !== 'General' && (
            <h3 className="text-lg font-semibold border-b pb-2">{category}</h3>
          )}
          <div className={gridLayout}>
            {fields.map(({ key, field }) => renderField(key, field))}
          </div>
        </div>
      ))}
    </div>
  );
}
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
}

export function ComputeClusterFormFields({ 
  schema, 
  form, 
  parentKey = '', 
  twoColumnLayout = true, 
  mode = 'new' 
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
  const shouldUseFullWidth = (field: any) => {
    if (field.format === 'textarea' || field.type === 'object' || field.type === 'array') {
      return true;
    }
    
    if (field.description && field.description.length > 100) {
      return true;
    }
    
    const fullWidthFields = ['aws_logs_uri', 'custom_image_uri'];
    return fullWidthFields.includes(field.name);
  };

  const renderArrayField = (key: string, field: any, fieldKey: string, formField: any, isRequired: boolean) => {
    const [showDescription, setShowDescription] = useState(false);
    const currentValue = formField.value || [];

    const addItem = (item: string) => {
      if (item && !currentValue.includes(item)) {
        formField.onChange([...currentValue, item]);
      }
    };

    const removeItem = (index: number) => {
      const newValue = currentValue.filter((_: any, i: number) => i !== index);
      formField.onChange(newValue);
    };

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
          {field.items?.enum && (
            <Select onValueChange={addItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select an application to add" />
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
              <FormItem className={shouldUseFullWidth(field) ? "col-span-2 w-full" : "w-full"}>
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
            return (
              <FormItem className={shouldUseFullWidth(field) ? "col-span-2 w-full" : "w-full"}>
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
                    {field.enum
                      .filter((option: string) => option !== "")
                      .map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
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
              <FormItem className="col-span-2 w-full">
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
            <FormItem className={shouldUseFullWidth(field) ? "col-span-2 w-full" : "w-full"}>
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
                <Input
                  {...formField}
                  type={field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.examples?.[0] || field.default || ''}
                  value={formField.value || ''}
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

  return (
    <div className={twoColumnLayout ? "grid grid-cols-2 gap-4" : "space-y-4"}>
      {Object.entries(fieldsByCategory).map(([category, fields]) => (
        <div key={category} className="col-span-2 space-y-4">
          {category !== 'General' && (
            <h3 className="text-lg font-semibold border-b pb-2">{category}</h3>
          )}
          <div className={twoColumnLayout ? "grid grid-cols-2 gap-4" : "space-y-4"}>
            {fields.map(({ key, field }) => renderField(key, field))}
          </div>
        </div>
      ))}
    </div>
  );
}
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface FormFieldsProps {
  schema: {
    properties?: Record<string, any>;
    type?: string;
    title?: string;
    required?: string[];
  };
  form: any;
  parentKey?: string;
}

export function FormFields({ schema, form, parentKey = '' }: FormFieldsProps) {
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

  const renderPasswordField = (key: string, field: any, fieldKey: string, formField: any, isRequired: boolean) => {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
      <FormItem key={fieldKey}>
        <FormLabel>
          {field.title || key}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </FormLabel>
        <div className="relative">
          <FormControl>
            <Input
              {...formField}
              type={showPassword ? 'text' : 'password'}
              placeholder={field.description || `Enter ${field.title || key}`}
            />
          </FormControl>
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {field.description && (
          <FormDescription>{field.description}</FormDescription>
        )}
        <FormMessage />
      </FormItem>
    );
  };

  const renderField = (key: string, field: any) => {
    const fieldKey = parentKey ? `${parentKey}.${key}` : key;
    const isRequired = schema.required?.includes(key);

    // Skip internal fields or those marked as advanced if not in advanced mode
    if (key.startsWith('_') || key === 'name') {
      return null;
    }

    if (field.type === 'object' && field.properties) {
      return (
        <div key={fieldKey} className="space-y-4 mt-4">
          <h3 className="text-lg font-semibold">{field.title || key}</h3>
          <div className="bg-muted/30 p-4 rounded-lg">
            <FormFields schema={field} form={form} parentKey={fieldKey} />
          </div>
        </div>
      );
    }

    return (
      <FormField
        key={fieldKey}
        control={form.control}
        name={fieldKey}
        render={({ field: formField }) => {
          // Handle different field types
          if (field.bh_secret || fieldKey.includes('password') || fieldKey.includes('secret')) {
            return renderPasswordField(key, field, fieldKey, formField, isRequired);
          }

          if (field.enum) {
            return (
              <FormItem>
                <FormLabel>
                  {field.title || key}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
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
                    {field.enum.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            );
          }

          if (field.type === 'boolean') {
            return (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>{field.title || key}</FormLabel>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
              </FormItem>
            );
          }

          if (field.type === 'string' && (field.format === 'json' || key.includes('json'))) {
            return (
              <FormItem>
                <FormLabel>
                  {field.title || key}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...formField}
                    placeholder={field.description || `Enter ${field.title || key}`}
                    className="font-mono h-48 resize-y"
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            );
          }

          // Default input field
          return (
            <FormItem>
              <FormLabel>
                {field.title || key}
                {isRequired && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <Input
                  {...formField}
                  type={field.type === 'integer' || field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.description || `Enter ${field.title || key}`}
                />
              </FormControl>
              {field.description && (
                <FormDescription>{field.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  };

  // If we have more than one category, use accordion
  if (Object.keys(fieldsByCategory).length > 1) {
    return (
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(fieldsByCategory).map(([category, fields]) => {
          if (fields.length === 0) return null;
          
          return (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center">
                  <span>{category}</span>
                  <Badge variant="outline" className="ml-2">
                    {fields.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {fields.map(({ key, field }) => renderField(key, field))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  }

  // Otherwise render fields directly
  return (
    <div className="space-y-6">
      {Object.entries(schema.properties).map(([key, value]) => renderField(key, value))}
    </div>
  );
}
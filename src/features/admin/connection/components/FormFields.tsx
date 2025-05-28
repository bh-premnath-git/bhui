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
import { HelpCircle, Eye, EyeOff } from 'lucide-react';
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
  twoColumnLayout?: boolean;
  mode?: 'edit' | 'new';
}

export function FormFields({ schema, form, parentKey = '', twoColumnLayout = true, mode = 'new' }: FormFieldsProps) {
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

  // Add a helper function to determine if a field should be masked
  const isSensitiveField = (key: string, field: any): boolean => {
    // Check field key names that typically contain sensitive data
    const sensitiveKeys = [
      'password', 'credentials', 'secret', 'key', 'token', 'auth',
      'host', 'port', 'username', 'bucket', 'schema' // Add connection fields
    ];
    
    // Check if any of the sensitive keys are present in the field key
    const keyContainsSensitive = sensitiveKeys.some(
      sensitiveKey => key.toLowerCase().includes(sensitiveKey)
    );
    
    // Check if the field is specifically a password field
    const isPasswordField = field.format === 'password' || 
                           (field.type === 'string' && field.airbyte_secret === true);
    
    return keyContainsSensitive || isPasswordField;
  };

  // Function to generate masked value
  const getMaskedValue = (value: string | undefined, isMasked: boolean): string => {
    // Only mask values in edit mode
    if (!isMasked || mode !== 'edit') return value || '';
    // Return a masked string only in edit mode
    return 'xxxxxxxxxx';
  };

  const renderPasswordField = (key: string, field: any, fieldKey: string, formField: any, isRequired: boolean) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    
    if (field.enum) {
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
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.enum
                .filter((option: string) => option !== "") // Filter out empty strings
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
    
    // Add this return statement for standard password fields
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
        <div className="relative">
          <FormControl>
            <Input
              {...formField}
              type={showPassword ? "text" : "password"}
              className="pr-10"
            />
          </FormControl>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        </div>
        <FormMessage />
      </FormItem>
    );
  };

  // Check if the field should take a full row (like textareas or complex fields)
  const shouldUseFullWidth = (field: any) => {
    // Special fields that should take full width
    if (field.format === 'textarea' || field.type === 'object') {
      return true;
    }
    
    // Any field with a long description might be better as full width
    if (field.description && field.description.length > 100) {
      return true;
    }
    
    // Special known fields that should be full width
    const fullWidthFields = ['credentials_json', 'file_path_prefix', 'jdbc_url_params'];
    return fullWidthFields.includes(field.name);
  };

  const renderField = (key: string, field: any) => {
    const fieldKey = parentKey ? `${parentKey}.${key}` : key;
    const isRequired = schema.required?.includes(key);
    const [showDescription, setShowDescription] = useState(false);

    // Skip internal fields or those marked as advanced if not in advanced mode
    if (key.startsWith('_') || key === 'name') {
      return null;
    }

    // Special case for credentials_json
    if (key === 'credentials_json') {
      return (
        <FormField
          key={fieldKey}
          control={form.control}
          name={fieldKey}
          render={({ field: formField }) => (
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
                  className="font-mono h-48 resize-y"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (field.type === 'object' && field.properties) {
      return (
        <div key={fieldKey} className="space-y-4 col-span-2 w-full">
          <h3 className="text-lg font-semibold">{field.title || key}</h3>
          <div className="p-4 rounded-lg">
            <FormFields schema={field} form={form} parentKey={fieldKey} twoColumnLayout={twoColumnLayout} />
          </div>
        </div>
      );
    }

    // For regular form fields (not objects)
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
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.enum
                      .filter((option: string) => option !== "") // Filter out empty strings
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

          if (field.format === 'password') {
            return renderPasswordField(key, field, fieldKey, formField, isRequired);
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
                  type={field.type === 'integer' || field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.examples?.[0] || field.default || ''}
                  value={isSensitiveField(key, field) ? getMaskedValue(formField.value, true) : formField.value}
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
    <div>
      {Object.entries(fieldsByCategory).map(([category, fields]) => (
        <div key={category} className="mb-6">
          {category !== 'General' && fields.length > 0 && (
            <h3 className="text-md font-semibold mb-4">{category}</h3>
          )}
          <div className={twoColumnLayout ? "grid grid-cols-2 gap-4" : "space-y-4"}>
            {fields.map(({ key, field }) => renderField(key, field))}
          </div>
        </div>
      ))}
    </div>
  );
}
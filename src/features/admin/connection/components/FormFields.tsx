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

  // Helper function to determine if a field is a password field (should have toggle)
  const isPasswordField = (key: string, field: any): boolean => {
    // Only treat as password field if explicitly marked as password
    return field.format === 'password' || 
           field.type === 'password' ||
           key.toLowerCase().includes('password');
  };

  // Helper function to determine if a field should be masked (but not necessarily have toggle)
  const isSensitiveField = (key: string, field: any): boolean => {
    // Check field key names that typically contain sensitive data
    const sensitiveKeys = [
      'credentials', 'secret', 'key', 'token', 'auth', 'password', 'private'
    ];
    
    // Check if any of the sensitive keys are present in the field key
    const keyContainsSensitive = sensitiveKeys.some(
      sensitiveKey => key.toLowerCase().includes(sensitiveKey)
    );
    
    // Check if the field is specifically marked as secret
    const isSecretField = field.airbyte_secret === true;
    
    return keyContainsSensitive || isSecretField;
  };
  
  // Helper function to determine if a field should prevent autocomplete
  const shouldPreventAutocomplete = (key: string): boolean => {
    const preventAutocompleteFields = [
      'access_key', 'secret_key', 'password', 'token', 'secret', 'credentials',
      'api_key', 'auth_token', 'private_key'
    ];
    
    const exactMatchFields = ['access_key', 'secret_key'];
    
    if (exactMatchFields.includes(key.toLowerCase())) {
      return true;
    }
    
    return preventAutocompleteFields.some(field => 
      key.toLowerCase().includes(field)
    );
  };

  // Function to generate masked value
  const getMaskedValue = (value: string | undefined, isMasked: boolean): string => {
    if (!isMasked || mode !== 'edit') return value || '';
    return value && value.length > 0 ? '•'.repeat(Math.min(value.length, 12)) : '';
  };

  // Enhanced password field renderer with proper toggle
  const renderPasswordField = (key: string, field: any, fieldKey: string, formField: any, isRequired: boolean) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    
    // Handle enum fields that are also sensitive
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
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent style={{ zIndex: 99999 }} >
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
    
    // Standard password field with toggle
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
            <div className="relative">
              {/* Hidden fake input to trick browsers */}
              <input 
                type="text" 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  height: 0, 
                  width: 0, 
                  padding: 0, 
                  border: 'none', 
                  opacity: 0 
                }} 
                tabIndex={-1} 
                aria-hidden="true"
                autoComplete="off"
              />
              <Input
                {...formField}
                type={showPassword ? "text" : "password"}
                required={isRequired} // required
                className="pr-10"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                data-form-type="password"
                name={`pwd_${Math.random().toString(36).substring(2, 10)}`}
                placeholder={field.examples?.[0] || field.default || ''}
                value={showPassword ? formField.value || '' : getMaskedValue(formField.value, mode === 'edit')}
                onChange={(e) => {
                  formField.onChange(e.target.value);
                }}
              />
            </div>
          </FormControl>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
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

  // Check if the field should take a full row
  const shouldUseFullWidth = (field: any) => {
    if (field.format === 'textarea' || field.type === 'object') {
      return true;
    }
    
    if (field.description && field.description.length > 100) {
      return true;
    }
    
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
                  className="font-mono h-48 resize-y"
                  placeholder={field.examples?.[0] || field.default || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    // Handle nested objects
    if (field.type === 'object' && field.properties) {
      return (
        <div key={fieldKey} className="space-y-4 col-span-2 w-full">
          <h3 className="text-lg font-semibold">
            {field.title || key}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </h3>
          <div className="p-4 rounded-lg border">
            <FormFields schema={field} form={form} parentKey={fieldKey} twoColumnLayout={twoColumnLayout} mode={mode} />
          </div>
        </div>
      );
    }

    // Check if this should be treated as a password field (with toggle)
    const shouldShowPasswordToggle = isPasswordField(key, field);

    // For regular form fields
    return (
      <FormField
        key={fieldKey}
        control={form.control}
        name={fieldKey}
        render={({ field: formField }) => {
          // Boolean fields
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

          // Enum fields
          if (field.enum) {
            // If it's a password enum field, render with toggle
            if (shouldShowPasswordToggle) {
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
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent style={{ zIndex: 99999 }} > 
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

          // Textarea fields
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
                    placeholder={field.examples?.[0] || field.default || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }

          // Password fields - render with toggle
          if (shouldShowPasswordToggle) {
            return renderPasswordField(key, field, fieldKey, formField, isRequired);
          }
          
          // Regular input fields
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
                {shouldPreventAutocomplete(key) ? (
                  <div className="relative">
                    {/* Hidden fake input to trick browsers */}
                    <input 
                      type="text" 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        height: 0, 
                        width: 0, 
                        padding: 0, 
                        border: 'none', 
                        opacity: 0 
                      }} 
                      tabIndex={-1} 
                      aria-hidden="true"
                      autoComplete="off"
                    />
                    <Input
                      {...formField}
                      type={field.type === 'integer' || field.type === 'number' ? 'number' : 'text'}
                      value={isSensitiveField(key, field) ? getMaskedValue(formField.value, true) : formField.value}
                      placeholder={field.examples?.[0] || field.default || ''}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                      data-form-type="other"
                      name={`field_${Math.random().toString(36).substring(2, 10)}`}
                      onChange={(e) => {
                        formField.onChange(e.target.value);
                      }}
                    />
                  </div>
                ) : ( //
                  <Input
                    {...formField}
                    type={field.type === 'integer' || field.type === 'number' ? 'number' : 'text'}
                    value={isSensitiveField(key, field) ? getMaskedValue(formField.value, true) : formField.value}
                    required
                    placeholder={field.examples?.[0] || field.default || ''}
                    autoComplete="off"
                  />
                )}
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
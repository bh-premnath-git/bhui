import * as z from 'zod';

export const generateFormSchema = (schema: any) => {
  const schemaMap: { [key: string]: any } = {};

  Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
    if (field.type === 'number') {
      schemaMap[key] = z.number({
        required_error: `${field.title} is required`,
        invalid_type_error: `${field.title} must be a number`,
      }).nullable().transform(val => (val === null ? undefined : val));
    } else if (field.type === 'string') {
      schemaMap[key] = z.string({
        required_error: `${field.title} is required`,
      });
    }
    // Add other types as needed
  });

  return z.object(schemaMap);
};

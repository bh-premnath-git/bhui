import { z } from 'zod';

export function generateFormSchema(jsonSchema: any) {
  // Return a basic schema if jsonSchema is null/undefined
  if (!jsonSchema || !jsonSchema.properties) {
    return z.object({
      name: z.string().optional(),
    });
  }

  const schema: any = {};

  Object.entries(jsonSchema.properties).forEach(([key, value]: [string, any]) => {
    if (value.type === 'string') {
      schema[key] = value.required ? z.string() : z.string().optional();
    } else if (value.type === 'integer') {
      schema[key] = value.required ? z.number() : z.number().optional();
    } else if (value.type === 'object' && value.properties) {
      schema[key] = generateFormSchema(value);
    }
    // Add more types as needed
  });

  return z.object(schema);
}

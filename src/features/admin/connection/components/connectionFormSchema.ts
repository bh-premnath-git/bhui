import * as z from 'zod';

export const generateFormSchema = (schema: any) => {
  const schemaMap: { [key: string]: any } = {};

  Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
    // Make port always optional, even if schema.required includes it
    const isRequired = schema.required?.includes(key);

    if (field.type === 'number') {
      let numberSchema: any = z
        .union([z.string().trim(), z.number()])
        .transform(val => (val === '' || val === undefined || val === null ? undefined : Number(val)))
        .refine(val => val === undefined || !isNaN(val), {
          message: `${field.title} must be a number`,
        });

      // Always set default if present
      if (field.default !== undefined) {
        numberSchema = numberSchema.default(field.default);
      }

      schemaMap[key] = numberSchema;
    } else if (field.type === 'string') {
      let stringSchema: any = z.string().trim();

      if (isRequired) {
        stringSchema = stringSchema.min(1, `${field.title} is required`);
      }

      if (field.default !== undefined) {
        stringSchema = stringSchema.default(field.default);
      }

      schemaMap[key] = stringSchema;
    }
    // Add other types as needed
  });

  return z.object(schemaMap);
};

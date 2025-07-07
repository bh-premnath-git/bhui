import * as z from 'zod';

export const generateFormSchema = (schema: any) => {
  const schemaMap: { [key: string]: any } = {};

  Object.entries(schema.properties).forEach(([key, field]: [string, any]) => {
    if (field.type === 'number') {
      let numberSchema:any = z.number({
        required_error: `${field.title} is required`,
        invalid_type_error: `${field.title} must be a number`,
      }).nullable().transform(val => (val === null ? undefined : val));
      
      // Add default value if present
      if (field.default !== undefined) {
        numberSchema = numberSchema.default(field.default);
      }
      
      schemaMap[key] = numberSchema;
    } else if (field.type === 'string') {
      let stringSchema:any = z.string({
        required_error: `${field.title} is required`,
      });
      
      // Add default value if present
      if (field.default !== undefined) {
        stringSchema = stringSchema.default(field.default);
      }
      
      schemaMap[key] = stringSchema;
    }
    // Add other types as needed
  });

  return z.object(schemaMap);
};
